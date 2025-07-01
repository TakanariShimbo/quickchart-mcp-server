import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { getDownloadPath } from "../utils/file.js";
import { QuickChartUrls } from "../utils/config.js";

/**
 * Tool description
 */
export const CREATE_WATERMARK_TOOL: Tool = {
  name: "create-watermark",
  description:
    "Add watermarks/logos to images using QuickChart - get watermarked image URL or save watermarked image to file",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["get_url", "save_file"],
        description: "Whether to get watermarked image URL or save as file",
      },
      outputPath: {
        type: "string",
        description:
          "Path where to save the file (only used with action=save_file)",
      },
      mainImageUrl: {
        type: "string",
        description: "URL of the main image to watermark",
      },
      markImageUrl: {
        type: "string",
        description: "URL of the watermark/logo image",
      },
      opacity: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description: "Watermark opacity (0.0 to 1.0)",
      },
      imageWidth: {
        type: "integer",
        description: "Main image width in pixels",
      },
      imageHeight: {
        type: "integer",
        description: "Main image height in pixels",
      },
      markWidth: {
        type: "integer",
        description: "Watermark width in pixels",
      },
      markHeight: {
        type: "integer",
        description: "Watermark height in pixels",
      },
      markRatio: {
        type: "number",
        description: "Watermark size ratio relative to main image",
      },
      position: {
        type: "string",
        enum: [
          "center",
          "topLeft",
          "topMiddle",
          "topRight",
          "middleLeft",
          "middleRight",
          "bottomLeft",
          "bottomMiddle",
          "bottomRight",
        ],
        description: "Watermark position",
      },
      positionX: {
        type: "integer",
        description: "Custom X position in pixels",
      },
      positionY: {
        type: "integer",
        description: "Custom Y position in pixels",
      },
      margin: {
        type: "integer",
        description: "Margin from edges in pixels",
      },
    },
    required: ["action", "mainImageUrl", "markImageUrl"],
  },
};

/**
 * Validates
 */
function validateMainImageUrl(mainImageUrl: string): void {
  if (
    !mainImageUrl ||
    typeof mainImageUrl !== "string" ||
    mainImageUrl.trim().length === 0
  ) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "MainImageUrl is required and must be a non-empty string"
    );
  }
}

function validateMarkImageUrl(markImageUrl: string): void {
  if (
    !markImageUrl ||
    typeof markImageUrl !== "string" ||
    markImageUrl.trim().length === 0
  ) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "MarkImageUrl is required and must be a non-empty string"
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

function validateOpacity(opacity?: number): void {
  if (opacity !== undefined) {
    if (typeof opacity !== "number" || opacity < 0 || opacity > 1) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Opacity must be a number between 0.0 and 1.0"
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

function validatePosition(position?: string): void {
  if (position !== undefined) {
    const validPositions = [
      "center", "topLeft", "topMiddle", "topRight",
      "middleLeft", "middleRight", "bottomLeft",
      "bottomMiddle", "bottomRight"
    ];
    if (!validPositions.includes(position)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid position: ${position}. Valid positions are: ${validPositions.join(", ")}`
      );
    }
  }
}

/**
 * Fetches
 */
function buildWatermarkConfig(
  mainImageUrl: string,
  markImageUrl: string,
  options: {
    opacity?: number;
    imageWidth?: number;
    imageHeight?: number;
    markWidth?: number;
    markHeight?: number;
    markRatio?: number;
    position?: string;
    positionX?: number;
    positionY?: number;
    margin?: number;
  } = {}
): any {
  const config: any = {
    mainImageUrl,
    markImageUrl,
  };

  if (options.opacity !== undefined) config.opacity = options.opacity;
  if (options.imageWidth !== undefined) config.imageWidth = options.imageWidth;
  if (options.imageHeight !== undefined)
    config.imageHeight = options.imageHeight;
  if (options.markWidth !== undefined) config.markWidth = options.markWidth;
  if (options.markHeight !== undefined) config.markHeight = options.markHeight;
  if (options.markRatio !== undefined) config.markRatio = options.markRatio;
  if (options.position) config.position = options.position;
  if (options.positionX !== undefined) config.positionX = options.positionX;
  if (options.positionY !== undefined) config.positionY = options.positionY;
  if (options.margin !== undefined) config.margin = options.margin;

  return config;
}

function buildWatermarkUrl(mainImageUrl: string, markImageUrl: string): string {
  const encodedMainUrl = encodeURIComponent(mainImageUrl);
  const encodedMarkUrl = encodeURIComponent(markImageUrl);

  return `https://quickchart.io/watermark?mainImageUrl=${encodedMainUrl}&markImageUrl=${encodedMarkUrl}`;
}

async function fetchWatermarkContent(postConfig: any): Promise<any> {
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
      QuickChartUrls.watermark(),
      postConfig,
      axiosConfig
    );
    return response.data;
  } catch (error) {
    const axiosError = error as any;
    const message = axiosError.response
      ? `Failed to fetch watermark content from QuickChart - Status: ${axiosError.response.status}`
      : `Failed to fetch watermark content from QuickChart - ${axiosError.message}`;

    throw new McpError(ErrorCode.InternalError, message);
  }
}

/**
 * Tool handler
 */
export async function handleWatermarkTool(args: any): Promise<any> {
  const mainImageUrl = args.mainImageUrl as string;
  const markImageUrl = args.markImageUrl as string;
  const action = args.action as string;
  
  validateMainImageUrl(mainImageUrl);
  validateMarkImageUrl(markImageUrl);
  validateAction(action);
  validateOutputPath(args.outputPath, action);
  validateOpacity(args.opacity);
  validateDimensions(args.imageWidth, args.imageHeight);
  validateDimensions(args.markWidth, args.markHeight);
  validatePosition(args.position);

  const config = buildWatermarkConfig(mainImageUrl, markImageUrl, {
    opacity: args.opacity as number,
    imageWidth: args.imageWidth as number,
    imageHeight: args.imageHeight as number,
    markWidth: args.markWidth as number,
    markHeight: args.markHeight as number,
    markRatio: args.markRatio as number,
    position: args.position as string,
    positionX: args.positionX as number,
    positionY: args.positionY as number,
    margin: args.margin as number,
  });
  const watermarkUrl = buildWatermarkUrl(mainImageUrl, markImageUrl);

  const result: any = {
    content: [
      {
        type: "text",
        text: "Below is the watermarked image URL:",
      },
      {
        type: "text",
        text: watermarkUrl,
      },
    ],
    metadata: {
      watermarkType: "image",
      generatedAt: new Date().toISOString(),
      watermarkUrl: watermarkUrl,
    },
  };

  let pngData: any = null;
  try {
    pngData = await fetchWatermarkContent(config);
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
      text: "⚠️ Failed to fetch watermarked image",
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

  const outputPath = getDownloadPath(
    args.outputPath as string | undefined,
    "png"
  );

  try {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // If pngData is null, fetch it again for file saving
    const dataToSave = pngData || await fetchWatermarkContent(config);
    fs.writeFileSync(outputPath, dataToSave);

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
      `Failed to save watermarked image: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
