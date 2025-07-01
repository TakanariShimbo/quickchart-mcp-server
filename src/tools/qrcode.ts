import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { getDownloadPath } from "../utils/file.js";
import { QuickChartUrls } from "../utils/config.js";

/**
 * Tool description
 */
export const CREATE_QR_CODE_TOOL: Tool = {
  name: "create-qr-code",
  description:
    "Create QR codes using QuickChart - get QR code image URL or save QR code image to file",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["get_url", "save_file"],
        description: "Whether to get QR code URL or save as file",
      },
      outputPath: {
        type: "string",
        description:
          "Path where to save the file (only used with action=save_file)",
      },
      text: {
        type: "string",
        description: "Content of the QR code (URL, text, etc.)",
      },
      format: {
        type: "string",
        enum: ["png", "svg", "base64"],
        description: "Output format (default: png)",
      },
      size: {
        type: "integer",
        description: "Image dimensions in pixels (default: 150)",
      },
      margin: {
        type: "integer",
        description: "Whitespace around QR image (default: 4)",
      },
      dark: {
        type: "string",
        description: "Hex color for QR grid cells (default: black)",
      },
      light: {
        type: "string",
        description:
          "Hex color for background (default: white, use '0000' for transparent)",
      },
      ecLevel: {
        type: "string",
        enum: ["L", "M", "Q", "H"],
        description: "Error correction level (default: M)",
      },
      centerImageUrl: {
        type: "string",
        description: "URL of center image (must be URL-encoded)",
      },
      centerImageSizeRatio: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description: "Center image size ratio (0.0-1.0, default: 0.3)",
      },
      caption: {
        type: "string",
        description: "Text below QR code",
      },
      captionFontFamily: {
        type: "string",
        description: "Caption font family (default: 'sans-serif')",
      },
      captionFontSize: {
        type: "integer",
        description: "Caption font size (default: 10)",
      },
      captionFontColor: {
        type: "string",
        description: "Caption text color (default: black)",
      },
    },
    required: ["action", "text"],
  },
};

/**
 * Validates
 */
function validateText(text: string): void {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Text is required and must be a non-empty string"
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

function validateFormat(format?: string): void {
  if (format !== undefined) {
    const validFormats = ["png", "svg", "base64"];
    if (!validFormats.includes(format)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid format: ${format}. Valid formats are: ${validFormats.join(", ")}`
      );
    }
  }
}

function validateSize(size?: number): void {
  if (size !== undefined) {
    if (!Number.isInteger(size) || size <= 0 || size > 10000) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Size must be a positive integer between 1 and 10000"
      );
    }
  }
}

function validateMargin(margin?: number): void {
  if (margin !== undefined) {
    if (!Number.isInteger(margin) || margin < 0 || margin > 100) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Margin must be an integer between 0 and 100"
      );
    }
  }
}

function validateEcLevel(ecLevel?: string): void {
  if (ecLevel !== undefined) {
    const validLevels = ["L", "M", "Q", "H"];
    if (!validLevels.includes(ecLevel)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid error correction level: ${ecLevel}. Valid levels are: ${validLevels.join(", ")}`
      );
    }
  }
}

function validateCenterImageSizeRatio(ratio?: number): void {
  if (ratio !== undefined) {
    if (typeof ratio !== "number" || ratio < 0 || ratio > 1) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Center image size ratio must be a number between 0.0 and 1.0"
      );
    }
  }
}

function validateFontSize(fontSize?: number): void {
  if (fontSize !== undefined) {
    if (!Number.isInteger(fontSize) || fontSize <= 0 || fontSize > 100) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Font size must be a positive integer between 1 and 100"
      );
    }
  }
}

/**
 * Fetches
 */
function buildQRCodeParams(
  text: string,
  options: {
    format?: string;
    size?: number;
    margin?: number;
    dark?: string;
    light?: string;
    ecLevel?: string;
    centerImageUrl?: string;
    centerImageSizeRatio?: number;
    caption?: string;
    captionFontFamily?: string;
    captionFontSize?: number;
    captionFontColor?: string;
  } = {}
): Record<string, string> {
  const params: Record<string, string> = {
    text: encodeURIComponent(text),
  };

  if (options.format) params.format = options.format;
  if (options.size !== undefined) params.size = options.size.toString();
  if (options.margin !== undefined) params.margin = options.margin.toString();
  if (options.dark) params.dark = options.dark;
  if (options.light) params.light = options.light;
  if (options.ecLevel) params.ecLevel = options.ecLevel;
  if (options.centerImageUrl)
    params.centerImageUrl = encodeURIComponent(options.centerImageUrl);
  if (options.centerImageSizeRatio !== undefined)
    params.centerImageSizeRatio = options.centerImageSizeRatio.toString();
  if (options.caption) params.caption = encodeURIComponent(options.caption);
  if (options.captionFontFamily)
    params.captionFontFamily = options.captionFontFamily;
  if (options.captionFontSize !== undefined)
    params.captionFontSize = options.captionFontSize.toString();
  if (options.captionFontColor)
    params.captionFontColor = options.captionFontColor;

  return params;
}

function buildQRCodeUrl(text: string): string {
  const encodedText = encodeURIComponent(text);

  return `https://quickchart.io/qr?text=${encodedText}`;
}

async function fetchQRCodeContent(
  params: Record<string, string>,
  format: string = "png"
): Promise<any> {
  const queryString = new URLSearchParams(params).toString();
  const qrUrl = `${QuickChartUrls.qrCode()}?${queryString}`;

  const isSvg = format === "svg";
  const axiosConfig = {
    responseType: (isSvg ? "text" : "arraybuffer") as any,
    timeout: 30000,
    headers: {
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
    const response = await axios.get(qrUrl, axiosConfig);
    return response.data;
  } catch (error) {
    const axiosError = error as any;
    const message = axiosError.response
      ? `Failed to fetch QR code content from QuickChart - Status: ${axiosError.response.status}`
      : `Failed to fetch QR code content from QuickChart - ${axiosError.message}`;

    throw new McpError(ErrorCode.InternalError, message);
  }
}

/**
 * Tool handler
 */
export async function handleQRCodeTool(args: any): Promise<any> {
  const text = args.text as string;
  const action = args.action as string;
  
  validateText(text);
  validateAction(action);
  validateOutputPath(args.outputPath, action);
  validateFormat(args.format);
  validateSize(args.size);
  validateMargin(args.margin);
  validateEcLevel(args.ecLevel);
  validateCenterImageSizeRatio(args.centerImageSizeRatio);
  validateFontSize(args.captionFontSize);

  const params = buildQRCodeParams(text, {
    format: args.format as string,
    size: args.size as number,
    margin: args.margin as number,
    dark: args.dark as string,
    light: args.light as string,
    ecLevel: args.ecLevel as string,
    centerImageUrl: args.centerImageUrl as string,
    centerImageSizeRatio: args.centerImageSizeRatio as number,
    caption: args.caption as string,
    captionFontFamily: args.captionFontFamily as string,
    captionFontSize: args.captionFontSize as number,
    captionFontColor: args.captionFontColor as string,
  });
  const chartUrl = buildQRCodeUrl(text);

  const result: any = {
    content: [
      {
        type: "text",
        text: "Below is the QR code URL:",
      },
      {
        type: "text",
        text: chartUrl,
      },
    ],
    metadata: {
      chartType: "qrcode",
      generatedAt: new Date().toISOString(),
      chartUrl: chartUrl,
    },
  };

  try {
    const pngData = await fetchQRCodeContent(params, "png");
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
      text: "⚠️ Failed to fetch QR code image",
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

    const data = await fetchQRCodeContent(params, format);
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
      `Failed to save QR code: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
