import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { getDownloadPath } from "../utils/file.js";
import { QuickChartUrls } from "../utils/config.js";

/**
 * Tool description
 */
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

/**
 * Validates
 */
function validateChart(chart: any): void {
  if (!chart || typeof chart !== "object") {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Chart must be a non-empty object"
    );
  }
}

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

function validateAction(action: string): void {
  if (!action || typeof action !== "string" || action.trim().length === 0) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Action must be a non-empty string"
    );
  }
  const validActions = ["get_url", "save_file"];
  if (!validActions.includes(action)) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid action: ${action}. Valid actions are: ${validActions.join(", ")}`
    );
  }
}

function validateOutputPath(
  outputPath: string | undefined,
  action: string
): void {
  if (
    action === "save_file" &&
    (!outputPath ||
      typeof outputPath !== "string" ||
      outputPath.trim().length === 0)
  ) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Output path is required for save_file action"
    );
  }
}

function validateFormat(format?: string): void {
  if (format !== undefined) {
    const validFormats = ["png", "webp", "jpg", "svg", "pdf", "base64"];
    if (!validFormats.includes(format)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid format: ${format}. Valid formats are: ${validFormats.join(
          ", "
        )}`
      );
    }
  }
}

function validateDimensions(width?: number, height?: number): void {
  if (width !== undefined) {
    if (!Number.isInteger(width) || width <= 0 || width > 10000) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Width must be a positive integer between 1 and 10000"
      );
    }
  }
  if (height !== undefined) {
    if (!Number.isInteger(height) || height <= 0 || height > 10000) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Height must be a positive integer between 1 and 10000"
      );
    }
  }
}

function validateDevicePixelRatio(devicePixelRatio?: number): void {
  if (devicePixelRatio !== undefined) {
    const validRatios = [1, 2];
    if (!validRatios.includes(devicePixelRatio)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid device pixel ratio: ${devicePixelRatio}. Valid ratios are: ${validRatios.join(
          ", "
        )}`
      );
    }
  }
}

function validateBackgroundColor(backgroundColor?: string): void {
  if (backgroundColor !== undefined) {
    if (
      typeof backgroundColor !== "string" ||
      backgroundColor.trim().length === 0
    ) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Background color must be a non-empty string"
      );
    }
  }
}

function validateVersion(version?: string): void {
  if (version !== undefined) {
    if (typeof version !== "string" || version.trim().length === 0) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Version must be a non-empty string"
      );
    }
  }
}

function validateEncoding(encoding?: string): void {
  if (encoding !== undefined) {
    const validEncodings = ["url", "base64"];
    if (!validEncodings.includes(encoding)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid encoding: ${encoding}. Valid encodings are: ${validEncodings.join(
          ", "
        )}`
      );
    }
  }
}

function validateKey(key?: string): void {
  if (key !== undefined) {
    if (typeof key !== "string" || key.trim().length === 0) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "API key must be a non-empty string"
      );
    }
  }
}

/**
 * Fetches
 */
function buildChartConfig(
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

function buildChartUrls(chartConfig: any): {
  chartUrl: string;
  editorUrl: string;
} {
  const chartOnlyJson = JSON.stringify(chartConfig);
  const encodedChart = encodeURIComponent(chartOnlyJson);

  return {
    chartUrl: `https://quickchart.io/chart?c=${encodedChart}`,
    editorUrl: `https://quickchart.io/sandbox#${encodedChart}`,
  };
}

async function fetchChartContent(
  postConfig: any,
  format: string = "png"
): Promise<any> {
  const config = { ...postConfig, format };
  const isSvg = format === "svg";
  const axiosConfig = {
    responseType: (isSvg ? "text" : "arraybuffer") as any,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: isSvg ? "image/svg+xml,*/*" : "image/*,*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
    },
    validateStatus: (status: number) => status >= 200 && status < 300,
  };

  try {
    const response = await axios.post(QuickChartUrls.chart(), config, axiosConfig);
    return response.data;
  } catch (error) {
    const axiosError = error as any;
    const message = axiosError.response
      ? `Failed to fetch chart content from QuickChart - Status: ${axiosError.response.status}`
      : `Failed to fetch chart content from QuickChart - ${axiosError.message}`;

    throw new McpError(ErrorCode.InternalError, message);
  }
}

/**
 * Tool handler
 */
export async function handleChartTool(args: any): Promise<any> {
  const chartConfig = args.chart as any;
  const action = args.action as string;

  validateChart(chartConfig);
  validateChartType(chartConfig.type as string);
  validateDatasets(chartConfig.data?.datasets as any[]);
  validateAction(action);
  validateOutputPath(args.outputPath, action);
  validateFormat(args.format);
  validateDimensions(args.width, args.height);
  validateDevicePixelRatio(args.devicePixelRatio);
  validateBackgroundColor(args.backgroundColor);
  validateVersion(args.version);
  validateEncoding(args.encoding);
  validateKey(args.key);

  const postConfig = buildChartConfig(chartConfig, {
    format: args.format as string,
    width: args.width as number,
    height: args.height as number,
    backgroundColor: args.backgroundColor as string,
    devicePixelRatio: args.devicePixelRatio as number,
    version: args.version as string,
    encoding: args.encoding as string,
    key: args.key as string,
  });
  const { chartUrl, editorUrl } = buildChartUrls(chartConfig);
  const pngData = await fetchChartContent(postConfig, "png");
  const pngBase64 = Buffer.from(pngData).toString("base64");

  const result: any = {
    content: [
      {
        type: "text",
        text: "Below is the chart URL:",
      },
      {
        type: "text",
        text: chartUrl,
      },
      {
        type: "text",
        text: "Below is the editor URL:",
      },
      {
        type: "text",
        text: editorUrl,
      },
      {
        type: "text",
        text: "Below is the PNG image:",
      },
      {
        type: "image",
        data: pngBase64,
        mimeType: "image/png",
      },
    ],
    metadata: {
      chartType: chartConfig.type,
      generatedAt: new Date().toISOString(),
      chartUrl: chartUrl,
      editableUrl: editorUrl,
      pngBase64: pngBase64,
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
    if (format === "svg") {
      fs.writeFileSync(outputPath, data, "utf8");
    } else {
      fs.writeFileSync(outputPath, data);
    }

    result.metadata.savedPath = outputPath;
    result.content.push({
      type: "text",
      text: "Below is the saved file path:",
    });
    result.content.push({
      type: "text",
      text: outputPath,
    });
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
