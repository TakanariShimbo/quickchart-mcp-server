import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { getDownloadPath } from "../utils/file.js";
import { QuickChartUrls } from "../utils/config.js";

export const CREATE_CHART_USING_CHARTJS_TOOL: Tool = {
  name: "create-chart-using-chartjs",
  description:
    "Create a chart using QuickChart.io - get chart image URL or save chart image to file",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["get_url", "save_file"],
        description: "Whether to get chart URL or save chart as file",
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
        description:
          "Canvas background color - rgb, hex, hsl, or color names (default: transparent)",
      },
      version: {
        type: "string",
        description:
          "Chart.js version - '2', '3', '4', or specific version (default: '2.9.4')",
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
    required: ["action", "chart"],
  },
};

export function validateChartType(type: string): void {
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

export function validateDatasets(datasets: any[]): void {
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

export function buildPostConfig(
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

function prepareChartConfig(chartConfig: any, args: any): any {
  return buildPostConfig(chartConfig, {
    format: args.format as string,
    width: args.width as number,
    height: args.height as number,
    backgroundColor: args.backgroundColor as string,
    devicePixelRatio: args.devicePixelRatio as number,
    version: args.version as string,
    encoding: args.encoding as string,
    key: args.key as string,
  });
}

function generateChartUrls(postConfig: any): {
  chartUrl: string;
  editorUrl: string;
} {
  const configJson = JSON.stringify(postConfig);
  const encodedConfig = encodeURIComponent(configJson);

  return {
    chartUrl: `https://quickchart.io/chart?c=${encodedConfig}`,
    editorUrl: `https://quickchart.io/editor?c=${encodedConfig}`,
  };
}

async function fetchChartContent(
  postConfig: any,
  format: string = "png"
): Promise<any> {
  const config = { ...postConfig, format };
  const responseType = format === "svg" ? "text" : "arraybuffer";

  try {
    const response = await axios.post(QuickChartUrls.chart(), config, {
      responseType: responseType as any,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to fetch chart content: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

async function fetchSvgContent(
  postConfig: any
): Promise<{ content: string; base64: string }> {
  const svgContent = (await fetchChartContent(postConfig, "svg")) as string;
  const base64 = Buffer.from(svgContent).toString("base64");

  return {
    content: svgContent,
    base64: base64,
  };
}

export async function handleChartTool(args: any): Promise<any> {
  const chartConfig = args.chart as any;
  if (!chartConfig) {
    throw new McpError(ErrorCode.InvalidParams, "Missing chart configuration");
  }

  validateChartType(chartConfig.type as string);
  validateDatasets(chartConfig.data?.datasets as any[]);

  const action = args.action as string;
  if (action !== "get_url" && action !== "save_file") {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid action: ${action}. Use 'get_url' or 'save_file'`
    );
  }

  const postConfig = prepareChartConfig(chartConfig, args);
  const { chartUrl, editorUrl } = generateChartUrls(postConfig);
  const svgData = await fetchSvgContent(postConfig);

  const result: any = {
    content: [
      {
        type: "text",
        text: editorUrl,
      },
      {
        type: "image",
        data: svgData.base64,
        mimeType: "image/svg+xml",
      },
    ],
    metadata: {
      chartType: chartConfig.type,
      generatedAt: new Date().toISOString(),
      chartUrl: chartUrl,
      editableUrl: editorUrl,
    },
  };

  if (action === "get_url") {
    return result;
  }

  const format = (args.format as string) || "png";
  const outputPath = getDownloadPath(
    args.outputPath as string | undefined,
    format
  );

  try {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const data = await fetchChartContent(postConfig, format);
    fs.writeFileSync(outputPath, data);

    result.metadata.savedPath = outputPath;
    return result;
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to save chart: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
