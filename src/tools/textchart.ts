import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { getDownloadPath } from "../utils/file.js";
import { QuickChartUrls } from "../utils/config.js";

/**
 * Tool description
 */
export const CREATE_CHART_USING_NATURAL_LANGUAGE_TOOL: Tool = {
  name: "create-chart-using-natural-language",
  description:
    "Create charts from natural language descriptions - get chart image URL or save chart image to file",
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
      description: {
        type: "string",
        description: "Natural language chart description",
      },
      width: {
        type: "integer",
        description: "Chart width in pixels",
      },
      height: {
        type: "integer",
        description: "Chart height in pixels",
      },
      backgroundColor: {
        type: "string",
        description: "Background color",
      },
      data1: {
        type: "string",
        description: "First dataset values (comma-separated)",
      },
      data2: {
        type: "string",
        description: "Second dataset values (comma-separated)",
      },
      labels: {
        type: "string",
        description: "Data labels (comma-separated)",
      },
      title: {
        type: "string",
        description: "Chart title",
      },
    },
    required: ["action", "description"],
  },
};

/**
 * Validates
 */
function validateDescription(description: string): void {
  if (
    !description ||
    typeof description !== "string" ||
    description.trim().length === 0
  ) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Description is required and must be a non-empty string"
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

function validateDataString(data?: string, fieldName?: string): void {
  if (data !== undefined) {
    if (typeof data !== "string" || data.trim().length === 0) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `${fieldName || "Data"} must be a non-empty string`
      );
    }
  }
}

/**
 * Fetches
 */
function buildTextChartConfig(
  description: string,
  options: {
    width?: number;
    height?: number;
    backgroundColor?: string;
    data1?: string;
    data2?: string;
    labels?: string;
    title?: string;
  } = {}
): any {
  const config: any = {
    description,
  };

  if (options.width !== undefined) config.width = options.width;
  if (options.height !== undefined) config.height = options.height;
  if (options.backgroundColor) config.backgroundColor = options.backgroundColor;
  if (options.data1) config.data1 = options.data1;
  if (options.data2) config.data2 = options.data2;
  if (options.labels) config.labels = options.labels;
  if (options.title) config.title = options.title;

  return config;
}

function buildTextChartUrl(description: string): string {
  const encodedDescription = encodeURIComponent(description);

  return `https://quickchart.io/natural/${encodedDescription}`;
}

async function fetchTextChartContent(
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
      QuickChartUrls.textChart(),
      postConfig,
      axiosConfig
    );
    return response.data;
  } catch (error) {
    const axiosError = error as any;
    const message = axiosError.response
      ? `Failed to fetch text chart content from QuickChart - Status: ${axiosError.response.status}`
      : `Failed to fetch text chart content from QuickChart - ${axiosError.message}`;

    throw new McpError(ErrorCode.InternalError, message);
  }
}

/**
 * Tool handler
 */
export async function handleTextChartTool(args: any): Promise<any> {
  const description = args.description as string;
  const action = args.action as string;
  
  validateDescription(description);
  validateAction(action);
  validateOutputPath(args.outputPath, action);
  validateDimensions(args.width, args.height);
  validateBackgroundColor(args.backgroundColor);
  validateDataString(args.data1, "Data1");
  validateDataString(args.data2, "Data2");
  validateDataString(args.labels, "Labels");
  validateDataString(args.title, "Title");

  const postConfig = buildTextChartConfig(description, {
    width: args.width as number,
    height: args.height as number,
    backgroundColor: args.backgroundColor as string,
    data1: args.data1 as string,
    data2: args.data2 as string,
    labels: args.labels as string,
    title: args.title as string,
  });
  const chartUrl = buildTextChartUrl(description);

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
      chartType: "natural-language",
      generatedAt: new Date().toISOString(),
      chartUrl: chartUrl,
    },
  };

  try {
    const pngData = await fetchTextChartContent(postConfig, "png");
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

    const data = await fetchTextChartContent(postConfig, format);
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
