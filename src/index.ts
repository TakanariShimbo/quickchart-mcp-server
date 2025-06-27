#!/usr/bin/env node

/**
 * 0. QuickChart MCP Server
 *
 * This server provides tools to generate charts using QuickChart.io API.
 *
 * Environment Variables:
 * - QUICKCHART_BASE_URL: Base URL for QuickChart API (default: "https://quickchart.io/chart")
 *   This can be overridden to use a self-hosted QuickChart instance
 *
 * Example:
 *   QUICKCHART_BASE_URL=https://custom.quickchart.io/chart node dist/index.js
 *   node dist/index.js  # Uses default QuickChart.io
 *
 * 0. QuickChart MCPサーバー
 *
 * このサーバーは、QuickChart.io APIを使用してチャートを生成するツールを提供します。
 *
 * 環境変数:
 * - QUICKCHART_BASE_URL: QuickChart APIのベースURL（デフォルト: "https://quickchart.io/chart"）
 *   セルフホストのQuickChartインスタンスを使用するためにオーバーライドできます
 *
 * 例:
 *   QUICKCHART_BASE_URL=https://custom.quickchart.io/chart node dist/index.js
 *   node dist/index.js  # デフォルトのQuickChart.ioを使用
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import getenv from "getenv";
import * as fs from "fs";
import * as path from "path";

/**
 * 1. Environment Configuration
 *
 * Get configuration from environment variables
 *
 * Examples:
 *   QUICKCHART_BASE_URL="https://quickchart.io/chart" → Default QuickChart.io API
 *   QUICKCHART_BASE_URL="https://custom.domain.com/chart" → Custom QuickChart instance
 *   No environment variables → Uses default QuickChart.io URL
 *
 * 1. 環境設定
 *
 * 環境変数から設定を取得
 *
 * 例:
 *   QUICKCHART_BASE_URL="https://quickchart.io/chart" → デフォルトのQuickChart.io API
 *   QUICKCHART_BASE_URL="https://custom.domain.com/chart" → カスタムQuickChartインスタンス
 *   環境変数なし → デフォルトのQuickChart.io URLを使用
 */
const QUICKCHART_BASE_URL = getenv(
  "QUICKCHART_BASE_URL",
  "https://quickchart.io/chart"
);

/**
 * 2. Tool Definitions
 *
 * Define the chart generation tools with their schemas
 *
 * Examples:
 *   Tool 1: "create-chart-using-chartjs" → Creates a chart URL or saves as file
 *   Chart types: bar, line, pie, doughnut, radar, polarArea, scatter, bubble, radialGauge, speedometer
 *   Returns: URL string or file path confirmation
 *
 * 2. ツール定義
 *
 * チャート生成ツールとそのスキーマを定義
 *
 * 例:
 *   ツール1: "create-chart-using-chartjs" → チャートURLを作成またはファイルとして保存
 *   チャートタイプ: bar, line, pie, doughnut, radar, polarArea, scatter, bubble, radialGauge, speedometer
 *   戻り値: URL文字列またはファイルパス確認
 */
const CREATE_CHART_USING_CHARTJS_TOOL: Tool = {
  name: "create-chart-using-chartjs",
  description: "Create a chart using QuickChart.io - get URL or save as file",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["get_url", "save_file"],
        description:
          "Whether to get chart URL or save chart as file (default: get_url)",
      },
      outputPath: {
        type: "string",
        description:
          "Path where to save the file (only used with action=save_file)",
      },
      width: {
        type: "integer",
        description: "Pixel width (default: 500)",
      },
      height: {
        type: "integer", 
        description: "Pixel height (default: 300)",
      },
      devicePixelRatio: {
        type: "integer",
        enum: [1, 2],
        description: "Pixel ratio for Retina support (default: 2)",
      },
      format: {
        type: "string",
        enum: ["png", "webp", "jpg", "svg", "pdf", "base64"],
        description: "Output format (default: png)",
      },
      backgroundColor: {
        type: "string",
        description: "Canvas background color - rgb, hex, hsl, or color names (default: transparent)",
      },
      version: {
        type: "string",
        description: "Chart.js version - '2', '3', '4', or specific version (default: '2.9.4')",
      },
      encoding: {
        type: "string",
        enum: ["url", "base64"],
        description: "Chart configuration encoding method (default: url)",
      },
      key: {
        type: "string",
        description: "API key (optional)",
      },
      chart: {
        type: "object",
        additionalProperties: true,
        description: "Chart.js configuration object",
        properties: {
          type: {
            type: "string",
            enum: [
              "bar",
              "line",
              "pie",
              "doughnut",
              "radar",
              "polarArea",
              "scatter",
              "bubble",
              "radialGauge",
              "speedometer",
            ],
            description: "The type of chart to generate",
          },
          data: {
            type: "object",
            additionalProperties: true,
            description: "Chart data",
            properties: {
              labels: {
                type: "array",
                items: {},
                description: "Labels for the data points",
              },
              datasets: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: true,
                  properties: {
                    data: {
                      description: "Data points",
                    },
                    label: {
                      type: "string",
                      description: "Label for this dataset",
                    },
                    backgroundColor: {
                      description: "Background color(s)",
                    },
                    borderColor: {
                      description: "Border color(s)",
                    },
                  },
                  required: ["data"],
                },
                description: "Datasets to display in the chart",
              },
            },
            required: ["datasets"],
          },
          options: {
            type: "object",
            additionalProperties: true,
            description: "Chart.js options",
          },
        },
        required: ["type", "data"],
      },
    },
    required: ["chart"],
  },
};

/**
 * 3. Server Initialization
 *
 * Create MCP server instance with metadata and capabilities
 *
 * Examples:
 *   Server name: "quickchart-server"
 *   Version: "1.0.0"
 *   Capabilities: tools (provides tool functionality)
 *   Transport: StdioServerTransport (communicates via stdin/stdout)
 *   Protocol: Model Context Protocol (MCP)
 *
 * 3. サーバー初期化
 *
 * メタデータと機能を持つMCPサーバーインスタンスを作成
 *
 * 例:
 *   サーバー名: "quickchart-server"
 *   バージョン: "1.0.0"
 *   機能: tools (ツール機能を提供)
 *   トランスポート: StdioServerTransport (stdin/stdout経由で通信)
 *   プロトコル: Model Context Protocol (MCP)
 */
const server = new Server(
  {
    name: "quickchart-server",
    version: "0.4.5",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * 4. Input Validation Functions
 *
 * Helper functions to validate chart inputs
 *
 * Examples:
 *   validateChartType("bar") → true
 *   validateChartType("invalid") → throws error
 *   validateDatasets([{ data: [1,2,3] }]) → true
 *   validateDatasets([]) → throws error
 *   validateScatterData([{ x: 1, y: 2 }]) → true
 *   validateBubbleData([{ x: 1, y: 2, r: 3 }]) → true
 *
 * 4. 入力検証関数
 *
 * チャート入力を検証するヘルパー関数
 *
 * 例:
 *   validateChartType("bar") → true
 *   validateChartType("invalid") → エラーをスロー
 *   validateDatasets([{ data: [1,2,3] }]) → true
 *   validateDatasets([]) → エラーをスロー
 *   validateScatterData([{ x: 1, y: 2 }]) → true
 *   validateBubbleData([{ x: 1, y: 2, r: 3 }]) → true
 */
function validateChartType(type: string): void {
  const validTypes = [
    "bar",
    "line",
    "pie",
    "doughnut",
    "radar",
    "polarArea",
    "scatter",
    "bubble",
    "radialGauge",
    "speedometer",
  ];
  if (!validTypes.includes(type)) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid chart type: ${type}. Valid types are: ${validTypes.join(", ")}`
    );
  }
}

function validateDatasets(datasets: any[]): void {
  if (!Array.isArray(datasets) || datasets.length === 0) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Datasets must be a non-empty array"
    );
  }

  datasets.forEach((dataset, index) => {
    if (!dataset.data) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Dataset at index ${index} must have a 'data' property`
      );
    }
  });
}

/**
 * 5. POST Request Configuration
 *
 * Build POST request configuration for QuickChart API
 *
 * Examples:
 *   buildPostConfig({ type: "bar", data: {...} }, { width: 800, height: 600 })
 *   → { chart: {...}, width: 800, height: 600, format: "png" }
 *   buildPostConfig({ type: "line", data: {...} }, { backgroundColor: "white" })
 *   → { chart: {...}, backgroundColor: "white", format: "png" }
 *
 * 5. POSTリクエスト設定
 *
 * QuickChart API用のPOSTリクエスト設定を構築
 *
 * 例:
 *   buildPostConfig({ type: "bar", data: {...} }, { width: 800, height: 600 })
 *   → { chart: {...}, width: 800, height: 600, format: "png" }
 *   buildPostConfig({ type: "line", data: {...} }, { backgroundColor: "white" })
 *   → { chart: {...}, backgroundColor: "white", format: "png" }
 */
function buildPostConfig(
  chartConfig: any,
  options: {
    format?: string;
    width?: number;
    height?: number;
    backgroundColor?: string;
    devicePixelRatio?: number;
    version?: string;
    encoding?: string;
    key?: string;
  } = {}
): any {
  return {
    width: options.width || 500,
    height: options.height || 300,
    devicePixelRatio: options.devicePixelRatio || 2,
    format: options.format || "png",
    backgroundColor: options.backgroundColor || "transparent",
    version: options.version || "2.9.4",
    ...(options.encoding && { encoding: options.encoding }),
    ...(options.key && { key: options.key }),
    chart: chartConfig,
  };
}

/**
 * 6. File Path Helper
 *
 * Get appropriate download path for chart files
 *
 * Examples:
 *   getDownloadPath() → "/Users/username/Desktop/chart_20240115_103045.png"
 *   getDownloadPath("/custom/path.png") → "/custom/path.png"
 *   getDownloadPath("mychart.png") → "/Users/username/Desktop/mychart.png"
 *   getDownloadPath(undefined, "svg") → "/Users/username/Desktop/chart_20240115_103045.svg"
 *   Falls back to home directory if Desktop doesn't exist
 *
 * 6. ファイルパスヘルパー
 *
 * チャートファイルの適切なダウンロードパスを取得
 *
 * 例:
 *   getDownloadPath() → "/Users/username/Desktop/chart_20240115_103045.png"
 *   getDownloadPath("/custom/path.png") → "/custom/path.png"
 *   getDownloadPath("mychart.png") → "/Users/username/Desktop/mychart.png"
 *   getDownloadPath(undefined, "svg") → "/Users/username/Desktop/chart_20240115_103045.svg"
 *   デスクトップが存在しない場合はホームディレクトリにフォールバック
 */
function getDownloadPath(outputPath?: string, format: string = "png"): string {
  if (outputPath) {
    if (path.isAbsolute(outputPath)) {
      return outputPath;
    }
    const desktopPath = path.join(
      process.env.HOME || process.env.USERPROFILE || ".",
      "Desktop"
    );
    if (fs.existsSync(desktopPath)) {
      return path.join(desktopPath, outputPath);
    }
    return path.join(
      process.env.HOME || process.env.USERPROFILE || ".",
      outputPath
    );
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T]/g, "")
    .split(".")[0];
  const filename = `chart_${timestamp}.${format}`;
  const desktopPath = path.join(
    process.env.HOME || process.env.USERPROFILE || ".",
    "Desktop"
  );

  if (fs.existsSync(desktopPath)) {
    return path.join(desktopPath, filename);
  }

  return path.join(
    process.env.HOME || process.env.USERPROFILE || ".",
    filename
  );
}

/**
 * 7. Tool List Handler
 *
 * Handle requests to list available tools
 *
 * Examples:
 *   Request: ListToolsRequest → Response: { tools: [CREATE_CHART_USING_CHARTJS_TOOL] }
 *   Available tools: create-chart-using-chartjs
 *   Tool count: 1
 *   This handler responds to MCP clients asking what tools are available
 *
 * 7. ツールリストハンドラー
 *
 * 利用可能なツールをリストするリクエストを処理
 *
 * 例:
 *   リクエスト: ListToolsRequest → レスポンス: { tools: [CREATE_CHART_USING_CHARTJS_TOOL] }
 *   利用可能なツール: create-chart-using-chartjs
 *   ツール数: 1
 *   このハンドラーは利用可能なツールを尋ねるMCPクライアントに応答
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [CREATE_CHART_USING_CHARTJS_TOOL],
}));

/**
 * 8. Tool Call Handler
 *
 * Set up the request handler for tool calls
 *
 * Examples:
 *   Request: { name: "create-chart-using-chartjs", arguments: { action: "get_url", type: "bar", ... } } → Returns chart URL
 *   Request: { name: "create-chart-using-chartjs", arguments: { action: "save_file", type: "bar", ... } } → Downloads and returns file path
 *   Request: { name: "unknown_tool" } → Error: "Unknown tool: unknown_tool"
 *   Invalid parameters → Error with specific validation message
 *   Network error → Error: "Failed to generate/download chart"
 *
 * 8. ツール呼び出しハンドラー
 *
 * ツール呼び出しのリクエストハンドラーを設定
 *
 * 例:
 *   リクエスト: { name: "create-chart-using-chartjs", arguments: { action: "get_url", type: "bar", ... } } → チャートURLを返す
 *   リクエスト: { name: "create-chart-using-chartjs", arguments: { action: "save_file", type: "bar", ... } } → ファイルを保存してパスを返す
 *   リクエスト: { name: "unknown_tool" } → エラー: "Unknown tool: unknown_tool"
 *   無効なパラメータ → 特定の検証メッセージを含むエラー
 *   ネットワークエラー → エラー: "Failed to generate/download chart"
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "create-chart-using-chartjs") {
      if (!args) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Missing arguments for create-chart-using-chartjs"
        );
      }
      // Extract chart configuration from args
      const chartConfig = args.chart as any;
      if (!chartConfig) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Missing chart configuration"
        );
      }

      validateChartType(chartConfig.type as string);
      validateDatasets(chartConfig.data?.datasets as any[]);

      const action = (args.action as string) || "get_url";

      if (action === "get_url") {
        const postConfig = buildPostConfig(chartConfig, {
          format: args.format as string,
          width: args.width as number,
          height: args.height as number,
          backgroundColor: args.backgroundColor as string,
          devicePixelRatio: args.devicePixelRatio as number,
          version: args.version as string,
          encoding: args.encoding as string,
          key: args.key as string,
        });

        return {
          content: [
            {
              type: "text",
              text: `POST to ${QUICKCHART_BASE_URL}\nContent-Type: application/json\n\n${JSON.stringify(
                postConfig,
                null,
                2
              )}`,
            },
          ],
        };
      }

      if (action === "save_file") {
        const format = (args.format as string) || "png";
        const outputPath = getDownloadPath(
          args.outputPath as string | undefined,
          format
        );

        const postConfig = buildPostConfig(chartConfig, {
          format: args.format as string,
          width: args.width as number,
          height: args.height as number,
          backgroundColor: args.backgroundColor as string,
          devicePixelRatio: args.devicePixelRatio as number,
          version: args.version as string,
          encoding: args.encoding as string,
          key: args.key as string,
        });

        try {
          const responseType = format === "svg" ? "text" : "arraybuffer";
          const response = await axios.post(QUICKCHART_BASE_URL, postConfig, {
            responseType: responseType as any,
            timeout: 30000,
            headers: {
              "Content-Type": "application/json",
            },
          });

          const dir = path.dirname(outputPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          if (format === "svg") {
            fs.writeFileSync(outputPath, response.data, "utf8");
          } else {
            fs.writeFileSync(outputPath, response.data);
          }

          return {
            content: [
              {
                type: "text",
                text: `Chart saved successfully to: ${outputPath}`,
              },
            ],
          };
        } catch (error) {
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to save chart: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      }

      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid action: ${action}. Use 'get_url' or 'save_file'`
      );
    }

    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(
      ErrorCode.InternalError,
      `Error executing tool ${name}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
});

/**
 * 9. Server Startup Function
 *
 * Initialize and run the MCP server with stdio transport
 *
 * Examples:
 *   Normal startup → "QuickChart MCP Server running on stdio"
 *   With custom URL → "QuickChart API URL: https://custom.quickchart.io/chart"
 *   Default URL → "QuickChart API URL: https://quickchart.io/chart"
 *   Connection error → Process exits with code 1
 *
 * 9. サーバー起動関数
 *
 * stdioトランスポートでMCPサーバーを初期化して実行
 *
 * 例:
 *   通常の起動 → "QuickChart MCP Server running on stdio"
 *   カスタムURLで → "QuickChart API URL: https://custom.quickchart.io/chart"
 *   デフォルトURL → "QuickChart API URL: https://quickchart.io/chart"
 *   接続エラー → プロセスはコード1で終了
 */
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`QuickChart MCP Server running on stdio`);
  console.error(`QuickChart API URL: ${QUICKCHART_BASE_URL}`);
}

/**
 * 10. Server Execution
 *
 * Execute the server and handle fatal errors
 *
 * Examples:
 *   Successful start → Server runs indefinitely, handling MCP requests
 *   Port already in use → "Fatal error running server: EADDRINUSE"
 *   Missing dependencies → "Fatal error running server: Cannot find module"
 *   Permission denied → "Fatal error running server: EACCES"
 *   Any fatal error → Logs error and exits with code 1
 *
 * 10. サーバー実行
 *
 * サーバーを実行し、致命的なエラーを処理
 *
 * 例:
 *   正常に開始 → サーバーは無期限に実行され、MCPリクエストを処理
 *   ポートが既に使用中 → "Fatal error running server: EADDRINUSE"
 *   依存関係が不足 → "Fatal error running server: Cannot find module"
 *   権限が拒否された → "Fatal error running server: EACCES"
 *   任意の致命的エラー → エラーをログに記録し、コード1で終了
 */
runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
