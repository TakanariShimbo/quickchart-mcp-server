import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { getDownloadPath } from "../utils/file.js";
import { QuickChartUrls } from "../utils/config.js";

/**
 * Tool description
 */
export const CREATE_CHART_USING_GOOGLECHARTS_TOOL: Tool = {
  name: "create-chart-using-googlecharts",
  description:
    "Create charts using Google Charts - get chart image URL or save chart image to file",
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
      code: {
        type: "string",
        description: "JavaScript drawChart function code",
      },
      packages: {
        type: "string",
        description: "Google Charts packages to load (default: 'corechart')",
      },
      width: {
        type: "integer",
        description: "Chart width in pixels",
      },
      height: {
        type: "integer",
        description: "Chart height in pixels",
      },
      mapsApiKey: {
        type: "string",
        description: "Google Maps API key (for geo charts)",
      },
    },
    required: ["action", "code"],
  },
};

/**
 * Validates
 */
function validateCode(code: string): void {
  if (!code || typeof code !== "string" || code.trim().length === 0) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Code is required and must be a non-empty string"
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

function validatePackages(packages?: string): void {
  if (packages !== undefined) {
    if (typeof packages !== "string" || packages.trim().length === 0) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Packages must be a non-empty string"
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

function validateMapsApiKey(mapsApiKey?: string): void {
  if (mapsApiKey !== undefined) {
    if (typeof mapsApiKey !== "string" || mapsApiKey.trim().length === 0) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Maps API key must be a non-empty string"
      );
    }
  }
}

/**
 * Fetches
 */
function buildGoogleChartsConfig(
  code: string,
  options: {
    packages?: string;
    width?: number;
    height?: number;
    mapsApiKey?: string;
  } = {}
): any {
  const config: any = {
    code,
    packages: options.packages || "corechart",
  };

  if (options.width !== undefined) config.width = options.width;
  if (options.height !== undefined) config.height = options.height;
  if (options.mapsApiKey) config.mapsApiKey = options.mapsApiKey;

  return config;
}

function buildGoogleChartsUrl(code: string): string {
  const encodedCode = encodeURIComponent(code);

  return `https://quickchart.io/google-charts/render?code=${encodedCode}`;
}

async function fetchGoogleChartsContent(
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
      QuickChartUrls.googleCharts(),
      postConfig,
      axiosConfig
    );
    return response.data;
  } catch (error) {
    const axiosError = error as any;
    const message = axiosError.response
      ? `Failed to fetch Google Charts content from QuickChart - Status: ${axiosError.response.status}`
      : `Failed to fetch Google Charts content from QuickChart - ${axiosError.message}`;

    throw new McpError(ErrorCode.InternalError, message);
  }
}

/**
 * Tool handler
 */
export async function handleGoogleChartsTool(args: any): Promise<any> {
  const code = args.code as string;
  const action = args.action as string;
  
  validateCode(code);
  validateAction(action);
  validateOutputPath(args.outputPath, action);
  validatePackages(args.packages);
  validateDimensions(args.width, args.height);
  validateMapsApiKey(args.mapsApiKey);

  const postConfig = buildGoogleChartsConfig(code, {
    packages: args.packages as string,
    width: args.width as number,
    height: args.height as number,
    mapsApiKey: args.mapsApiKey as string,
  });
  const chartUrl = buildGoogleChartsUrl(code);

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
      chartType: args.packages || "corechart",
      generatedAt: new Date().toISOString(),
      chartUrl: chartUrl,
    },
  };

  try {
    const pngData = await fetchGoogleChartsContent(postConfig, "png");
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

    const data = await fetchGoogleChartsContent(postConfig, format);
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
