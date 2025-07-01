import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { getDownloadPath } from "../utils/file.js";
import { QuickChartUrls } from "../utils/config.js";

/**
 * Tool description
 */
export const CREATE_CHART_USING_APEXCHARTS_TOOL: Tool = {
  name: "create-chart-using-apexcharts",
  description:
    "Create charts using Apex Charts - get chart image URL or save chart image to file",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["get_url", "save_file"],
        description: "Whether to get chart URL or save as file",
      },
      outputPath: {
        type: "string",
        description:
          "Path where to save the file (only used with action=save_file)",
      },
      config: {
        type: "object",
        description: "Apex Charts JSON configuration",
      },
      width: {
        type: "integer",
        description: "Image width in pixels",
      },
      height: {
        type: "integer",
        description: "Image height in pixels",
      },
      apexChartsVersion: {
        type: "string",
        description: "Apex Charts version to use",
      },
    },
    required: ["action", "config"],
  },
};

/**
 * Validates
 */
function validateConfig(config: any): void {
  if (!config || typeof config !== "object") {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Config is required and must be an object"
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

function validateApexChartsVersion(version?: string): void {
  if (version !== undefined) {
    if (typeof version !== "string" || version.trim().length === 0) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "ApexCharts version must be a non-empty string"
      );
    }
  }
}

/**
 * Fetches
 */
function buildApexChartsConfig(
  config: any,
  options: {
    width?: number;
    height?: number;
    apexChartsVersion?: string;
  } = {}
): any {
  const payload: any = {
    config,
  };

  if (options.width !== undefined) payload.width = options.width;
  if (options.height !== undefined) payload.height = options.height;
  if (options.apexChartsVersion)
    payload.apexChartsVersion = options.apexChartsVersion;

  return payload;
}

function buildApexChartsUrl(config: any): string {
  const configOnlyJson = JSON.stringify(config);
  const encodedConfig = encodeURIComponent(configOnlyJson);

  return `https://quickchart.io/apex-charts/render?config=${encodedConfig}`;
}

async function fetchApexChartsContent(
  postConfig: any,
  format: string = "png"
): Promise<any> {
  const axiosConfig = {
    responseType: "arraybuffer" as any,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
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
    const response = await axios.post(
      QuickChartUrls.apexCharts(),
      postConfig,
      axiosConfig
    );
    return response.data;
  } catch (error) {
    const axiosError = error as any;
    const message = axiosError.response
      ? `Failed to fetch ApexCharts content from QuickChart - Status: ${axiosError.response.status}`
      : `Failed to fetch ApexCharts content from QuickChart - ${axiosError.message}`;

    throw new McpError(ErrorCode.InternalError, message);
  }
}

/**
 * Tool handler
 */
export async function handleApexChartsTool(args: any): Promise<any> {
  const config = args.config as any;
  const action = args.action as string;
  
  validateConfig(config);
  validateAction(action);
  validateOutputPath(args.outputPath, action);
  validateDimensions(args.width, args.height);
  validateApexChartsVersion(args.apexChartsVersion);

  const postConfig = buildApexChartsConfig(config, {
    width: args.width as number,
    height: args.height as number,
    apexChartsVersion: args.apexChartsVersion as string,
  });
  const chartUrl = buildApexChartsUrl(config);

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
      chartType: config?.chart?.type || "unknown",
      generatedAt: new Date().toISOString(),
      chartUrl: chartUrl,
    },
  };

  try {
    const pngData = await fetchApexChartsContent(postConfig, "png");
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

    const data = await fetchApexChartsContent(postConfig, format);
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
