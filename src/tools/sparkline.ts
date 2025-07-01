import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { getDownloadPath } from "../utils/file.js";
import { QuickChartUrls } from "../utils/config.js";

/**
 * Tool description
 */
export const CREATE_SPARKLINE_USING_CHARTJS_TOOL: Tool = {
  name: "create-sparkline-using-chartjs",
  description:
    "Create sparkline charts using Chart.js - get sparkline image URL or save sparkline image to file",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["get_url", "save_file"],
        description: "Whether to get sparkline URL or save as file",
      },
      outputPath: {
        type: "string",
        description:
          "Path where to save the file (only used with action=save_file)",
      },
      chart: {
        type: "object",
        description: "Chart.js configuration for sparkline",
      },
      width: {
        type: "integer",
        description: "Chart width in pixels (default: 100)",
      },
      height: {
        type: "integer",
        description: "Chart height in pixels (default: 30)",
      },
      devicePixelRatio: {
        type: "integer",
        enum: [1, 2],
        description: "Device pixel ratio (default: 2)",
      },
      backgroundColor: {
        type: "string",
        description: "Background color (default: transparent)",
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
      "Chart configuration is required and must be an object"
    );
  }
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
        `Invalid device pixel ratio: ${devicePixelRatio}. Valid ratios are: ${validRatios.join(", ")}`
      );
    }
  }
}

function validateBackgroundColor(backgroundColor?: string): void {
  if (backgroundColor !== undefined) {
    if (typeof backgroundColor !== "string" || backgroundColor.trim().length === 0) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Background color must be a non-empty string"
      );
    }
  }
}

/**
 * Fetches
 */
function buildSparklineParams(
  chart: any,
  options: {
    width?: number;
    height?: number;
    devicePixelRatio?: number;
    backgroundColor?: string;
  } = {}
): Record<string, string> {
  const params: Record<string, string> = {
    c: JSON.stringify(chart),
    w: (options.width || 100).toString(),
    h: (options.height || 30).toString(),
  };

  if (options.devicePixelRatio !== undefined) {
    params.devicePixelRatio = options.devicePixelRatio.toString();
  }
  if (options.backgroundColor) {
    params.bkg = options.backgroundColor;
  }

  return params;
}

function buildSparklineUrl(chart: any): string {
  const encodedChart = encodeURIComponent(JSON.stringify(chart));

  return `https://quickchart.io/chart?c=${encodedChart}`;
}

async function fetchSparklineContent(
  params: Record<string, string>,
  format: string = "png"
): Promise<any> {
  const queryString = new URLSearchParams(params).toString();
  const sparklineUrl = `${QuickChartUrls.sparkline()}?${queryString}`;

  const axiosConfig = {
    responseType: "arraybuffer" as any,
    timeout: 30000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "image/*,*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
    },
    validateStatus: (status: number) => status >= 200 && status < 300,
  };

  try {
    const response = await axios.get(sparklineUrl, axiosConfig);
    return response.data;
  } catch (error) {
    const axiosError = error as any;
    const message = axiosError.response
      ? `Failed to fetch sparkline content from QuickChart - Status: ${axiosError.response.status}`
      : `Failed to fetch sparkline content from QuickChart - ${axiosError.message}`;

    throw new McpError(ErrorCode.InternalError, message);
  }
}

/**
 * Tool handler
 */
export async function handleSparklineTool(args: any): Promise<any> {
  const chart = args.chart as any;
  const action = args.action as string;
  
  validateChart(chart);
  validateAction(action);
  validateOutputPath(args.outputPath, action);
  validateDimensions(args.width, args.height);
  validateDevicePixelRatio(args.devicePixelRatio);
  validateBackgroundColor(args.backgroundColor);

  const params = buildSparklineParams(chart, {
    width: args.width as number,
    height: args.height as number,
    devicePixelRatio: args.devicePixelRatio as number,
    backgroundColor: args.backgroundColor as string,
  });
  const chartUrl = buildSparklineUrl(chart);

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
    ],
    metadata: {
      chartType: chart?.type || "sparkline",
      generatedAt: new Date().toISOString(),
      chartUrl: chartUrl,
    },
  };

  try {
    const pngData = await fetchSparklineContent(params, "png");
    const pngBase64 = Buffer.from(pngData).toString("base64");

    result.content.push(
      {
        type: "text",
        text: "Below is the PNG image:",
      },
      {
        type: "image",
        data: pngBase64,
        mimeType: "image/png",
      }
    );
    result.metadata.pngBase64 = pngBase64;
  } catch (error) {
    result.content.unshift({
      type: "text",
      text: "⚠️ Failed to fetch chart image",
    });
    result.content.push({
      type: "text",
      text: `Error: ${error instanceof Error ? error.message : String(error)}`,
    });
    result.metadata.error =
      error instanceof Error ? error.message : String(error);
  }

  if (action === "get_url") {
    return result;
  }

  const format = "png";
  const outputPath = getDownloadPath(
    args.outputPath as string | undefined,
    format
  );

  try {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const data = await fetchSparklineContent(params, format);
    fs.writeFileSync(outputPath, data);

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
