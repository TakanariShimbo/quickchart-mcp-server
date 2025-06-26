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
 * 2. Type Definitions
 *
 * Define interfaces for chart configurations
 *
 * Examples:
 *   Dataset: { data: [10, 20, 30], label: "Sales", backgroundColor: "blue" }
 *   ChartConfiguration: { type: "bar", labels: ["Q1", "Q2"], datasets: [...] }
 *   ScatterData: { x: 10, y: 20 }
 *   BubbleData: { x: 10, y: 20, r: 5 }
 *
 * 2. 型定義
 *
 * チャート設定のインターフェースを定義
 *
 * 例:
 *   Dataset: { data: [10, 20, 30], label: "売上", backgroundColor: "blue" }
 *   ChartConfiguration: { type: "bar", labels: ["Q1", "Q2"], datasets: [...] }
 *   ScatterData: { x: 10, y: 20 }
 *   BubbleData: { x: 10, y: 20, r: 5 }
 */
interface Dataset {
  data:
    | number[]
    | { x: number; y: number }[]
    | { x: number; y: number; r: number }[];
  label?: string;
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  additionalConfig?: any;
}


/**
 * 3. Tool Definitions
 *
 * Define the chart generation tools with their schemas
 *
 * Examples:
 *   Tool 1: "generate_chart" → Creates a chart URL
 *   Tool 2: "download_chart" → Downloads chart as image file
 *   Chart types: bar, line, pie, doughnut, radar, polarArea, scatter, bubble, radialGauge, speedometer
 *   Returns: URL string or file path confirmation
 *
 * 3. ツール定義
 *
 * チャート生成ツールとそのスキーマを定義
 *
 * 例:
 *   ツール1: "generate_chart" → チャートURLを作成
 *   ツール2: "download_chart" → チャートを画像ファイルとしてダウンロード
 *   チャートタイプ: bar, line, pie, doughnut, radar, polarArea, scatter, bubble, radialGauge, speedometer
 *   戻り値: URL文字列またはファイルパス確認
 */
const CREATE_CHART_TOOL: Tool = {
  name: "create_chart",
  description: "Create a chart using QuickChart.io - get URL or save as file",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["get_url", "save_file"],
        description: "Whether to get chart URL or save chart as file (default: get_url)",
      },
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
      labels: {
        type: "array",
        items: { type: "string" },
        description:
          "Labels for the data points (not used for scatter/bubble charts)",
      },
      datasets: {
        type: "array",
        items: {
          type: "object",
          properties: {
            data: {
              description:
                "Data points - array of numbers for most charts, array of {x,y} for scatter, array of {x,y,r} for bubble",
            },
            label: {
              type: "string",
              description: "Label for this dataset",
            },
            backgroundColor: {
              description:
                "Background color(s) - single color or array of colors",
            },
            borderColor: {
              description: "Border color(s) - single color or array of colors",
            },
            additionalConfig: {
              type: "object",
              description: "Additional Chart.js configuration for this dataset",
            },
          },
          required: ["data"],
        },
        description: "Datasets to display in the chart",
      },
      title: {
        type: "string",
        description: "Title of the chart",
      },
      options: {
        type: "object",
        description: "Additional Chart.js options",
      },
      outputPath: {
        type: "string",
        description:
          "Path where to save the file (only used with action=save_file, optional, defaults to Desktop)",
      },
      format: {
        type: "string",
        enum: ["png", "webp", "jpg", "svg", "pdf"],
        description: "Output format for the chart (only used with action=save_file, default: png)",
      },
    },
    required: ["type", "datasets"],
  },
};

/**
 * 4. Server Initialization
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
 * 4. サーバー初期化
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
    version: "0.4.2",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * 5. Input Validation Functions
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
 * 5. 入力検証関数
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
 * 6. Chart Configuration Builder
 *
 * Build Chart.js configuration from parameters
 *
 * Examples:
 *   buildChartConfig({ type: "bar", labels: ["A", "B"], datasets: [...] })
 *   → Returns Chart.js config object with proper structure
 *   buildChartConfig({ type: "scatter", datasets: [{ data: [{x:1, y:2}] }] })
 *   → Returns scatter chart config without labels
 *   buildChartConfig({ type: "radialGauge", datasets: [{ data: [75] }] })
 *   → Returns gauge chart config with special plugin
 *
 * 6. チャート設定ビルダー
 *
 * パラメータからChart.js設定を構築
 *
 * 例:
 *   buildChartConfig({ type: "bar", labels: ["A", "B"], datasets: [...] })
 *   → 適切な構造を持つChart.js設定オブジェクトを返す
 *   buildChartConfig({ type: "scatter", datasets: [{ data: [{x:1, y:2}] }] })
 *   → ラベルなしのscatterチャート設定を返す
 *   buildChartConfig({ type: "radialGauge", datasets: [{ data: [75] }] })
 *   → 特別なプラグインを持つゲージチャート設定を返す
 */
function buildChartConfig(params: any): any {
  const { type, labels, datasets, title, options } = params;

  const config: any = {
    type:
      type === "radialGauge" || type === "speedometer" ? "radialGauge" : type,
    data: {
      datasets: datasets.map((dataset: Dataset) => {
        const chartDataset: any = {
          data: dataset.data,
          label: dataset.label,
          backgroundColor: dataset.backgroundColor,
          borderColor: dataset.borderColor,
          ...dataset.additionalConfig,
        };
        return chartDataset;
      }),
    },
    options: {
      ...options,
      plugins: {
        title: title
          ? {
              display: true,
              text: title,
            }
          : undefined,
      },
    },
  };

  if (labels && type !== "scatter" && type !== "bubble") {
    config.data.labels = labels;
  }

  if (type === "radialGauge" || type === "speedometer") {
    config.options.plugins.datalabels = {
      display: true,
      formatter: (value: number) => `${value}%`,
      color: "black",
      font: {
        size: 20,
        weight: "bold",
      },
    };
  }

  return config;
}

/**
 * 7. URL Generation Function
 *
 * Generate QuickChart URL from configuration
 *
 * Examples:
 *   generateChartUrl({ type: "bar", data: {...} })
 *   → "https://quickchart.io/chart?c=%7B%22type%22%3A%22bar%22..."
 *   generateChartUrl({ type: "line", data: {...} }, "https://custom.io/chart")
 *   → "https://custom.io/chart?c=%7B%22type%22%3A%22line%22..."
 *   Large configurations are automatically URL-encoded
 *
 * 7. URL生成関数
 *
 * 設定からQuickChart URLを生成
 *
 * 例:
 *   generateChartUrl({ type: "bar", data: {...} })
 *   → "https://quickchart.io/chart?c=%7B%22type%22%3A%22bar%22..."
 *   generateChartUrl({ type: "line", data: {...} }, "https://custom.io/chart")
 *   → "https://custom.io/chart?c=%7B%22type%22%3A%22line%22..."
 *   大きな設定は自動的にURLエンコードされる
 */
function generateChartUrl(
  config: any,
  baseUrl: string = QUICKCHART_BASE_URL,
  format: string = "png"
): string {
  const chartJson = JSON.stringify(config);
  const encodedChart = encodeURIComponent(chartJson);
  return `${baseUrl}?c=${encodedChart}&format=${format}`;
}

/**
 * 8. File Path Helper
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
 * 8. ファイルパスヘルパー
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
 * 9. Tool List Handler
 *
 * Handle requests to list available tools
 *
 * Examples:
 *   Request: ListToolsRequest → Response: { tools: [CREATE_CHART_TOOL] }
 *   Available tools: create_chart
 *   Tool count: 1
 *   This handler responds to MCP clients asking what tools are available
 *
 * 9. ツールリストハンドラー
 *
 * 利用可能なツールをリストするリクエストを処理
 *
 * 例:
 *   リクエスト: ListToolsRequest → レスポンス: { tools: [CREATE_CHART_TOOL] }
 *   利用可能なツール: create_chart
 *   ツール数: 1
 *   このハンドラーは利用可能なツールを尋ねるMCPクライアントに応答
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [CREATE_CHART_TOOL],
}));

/**
 * 10. Tool Call Handler
 *
 * Set up the request handler for tool calls
 *
 * Examples:
 *   Request: { name: "generate_chart", arguments: { type: "bar", ... } } → Returns chart URL
 *   Request: { name: "download_chart", arguments: { config: {...} } } → Downloads and returns file path
 *   Request: { name: "unknown_tool" } → Error: "Unknown tool: unknown_tool"
 *   Invalid parameters → Error with specific validation message
 *   Network error → Error: "Failed to generate/download chart"
 *
 * 10. ツール呼び出しハンドラー
 *
 * ツール呼び出しのリクエストハンドラーを設定
 *
 * 例:
 *   リクエスト: { name: "create_chart", arguments: { action: "get_url", type: "bar", ... } } → チャートURLを返す
 *   リクエスト: { name: "create_chart", arguments: { action: "save_file", type: "bar", ... } } → ファイルを保存してパスを返す
 *   リクエスト: { name: "unknown_tool" } → エラー: "Unknown tool: unknown_tool"
 *   無効なパラメータ → 特定の検証メッセージを含むエラー
 *   ネットワークエラー → エラー: "Failed to generate/download chart"
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "create_chart") {
      if (!args) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Missing arguments for create_chart"
        );
      }
      validateChartType(args.type as string);
      validateDatasets(args.datasets as any[]);

      const action = (args.action as string) || "get_url";
      const config = buildChartConfig(args);

      if (action === "get_url") {
        const chartUrl = generateChartUrl(config);
        return {
          content: [
            {
              type: "text",
              text: chartUrl,
            },
          ],
        };
      }

      if (action === "save_file") {
        const format = (args.format as string) || "png";
        const chartUrl = generateChartUrl(config, QUICKCHART_BASE_URL, format);
        const outputPath = getDownloadPath(args.outputPath as string | undefined, format);

        try {
          const responseType = format === "svg" ? "text" : "arraybuffer";
          const response = await axios.get(chartUrl, {
            responseType: responseType as any,
            timeout: 30000,
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
 * 11. Server Startup Function
 *
 * Initialize and run the MCP server with stdio transport
 *
 * Examples:
 *   Normal startup → "QuickChart MCP Server running on stdio"
 *   With custom URL → "QuickChart API URL: https://custom.quickchart.io/chart"
 *   Default URL → "QuickChart API URL: https://quickchart.io/chart"
 *   Connection error → Process exits with code 1
 *
 * 11. サーバー起動関数
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
 * 12. Server Execution
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
 * 12. サーバー実行
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
