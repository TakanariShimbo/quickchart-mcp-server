import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { getDownloadPath } from "../utils/file.js";
import { QuickChartUrls } from "../utils/config.js";

/**
 * Tool description
 */
export const CREATE_BARCODE_TOOL: Tool = {
  name: "create-barcode",
  description:
    "Create barcodes using QuickChart - get barcode image URL or save barcode image to file",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["get_url", "save_file"],
        description: "Whether to get barcode URL or save as file",
      },
      outputPath: {
        type: "string",
        description:
          "Path where to save the file (only used with action=save_file)",
      },
      type: {
        type: "string",
        description:
          "Barcode type (e.g., qr, code128, ean13, datamatrix, upca, etc.)",
      },
      text: {
        type: "string",
        description: "Data to encode in the barcode",
      },
      width: {
        type: "integer",
        description: "Barcode width",
      },
      height: {
        type: "integer",
        description: "Barcode height",
      },
      scale: {
        type: "integer",
        description: "Scale factor",
      },
      includeText: {
        type: "boolean",
        description: "Include human-readable text below barcode",
      },
      rotate: {
        type: "string",
        enum: ["N", "R", "L", "I"],
        description:
          "Rotation: N=Normal, R=Right 90°, L=Left 90°, I=Inverted 180°",
      },
    },
    required: ["action", "type", "text"],
  },
};

/**
 * Validates
 */
function validateBarcodeType(type: string): void {
  if (!type || typeof type !== "string" || type.trim().length === 0) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Type is required and must be a non-empty string"
    );
  }
}

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

function validateScale(scale?: number): void {
  if (scale !== undefined) {
    if (!Number.isInteger(scale) || scale <= 0 || scale > 10) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Scale must be a positive integer between 1 and 10"
      );
    }
  }
}

function validateRotation(rotate?: string): void {
  if (rotate !== undefined) {
    const validRotations = ["N", "R", "L", "I"];
    if (!validRotations.includes(rotate)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid rotation: ${rotate}. Valid rotations are: ${validRotations.join(", ")}`
      );
    }
  }
}

/**
 * Fetches
 */
function buildBarcodeParams(
  type: string,
  text: string,
  options: {
    width?: number;
    height?: number;
    scale?: number;
    includeText?: boolean;
    rotate?: string;
  } = {}
): Record<string, string> {
  const params: Record<string, string> = {
    type,
    text,
  };

  if (options.width !== undefined) params.width = options.width.toString();
  if (options.height !== undefined) params.height = options.height.toString();
  if (options.scale !== undefined) params.scale = options.scale.toString();
  if (options.includeText !== undefined)
    params.includeText = options.includeText.toString();
  if (options.rotate) params.rotate = options.rotate;

  return params;
}

function buildBarcodeUrl(type: string, text: string): string {
  const simpleParams = new URLSearchParams({
    type,
    text,
  }).toString();

  return `https://quickchart.io/barcode?${simpleParams}`;
}

async function fetchBarcodeContent(
  params: Record<string, string>,
  format: string = "png"
): Promise<any> {
  const queryString = new URLSearchParams(params).toString();
  const barcodeUrl = `${QuickChartUrls.barcode()}?${queryString}`;

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
    const response = await axios.get(barcodeUrl, axiosConfig);
    return response.data;
  } catch (error) {
    const axiosError = error as any;
    const message = axiosError.response
      ? `Failed to fetch barcode content from QuickChart - Status: ${axiosError.response.status}`
      : `Failed to fetch barcode content from QuickChart - ${axiosError.message}`;

    throw new McpError(ErrorCode.InternalError, message);
  }
}

/**
 * Tool handler
 */
export async function handleBarcodeTool(args: any): Promise<any> {
  const type = args.type as string;
  const text = args.text as string;
  const action = args.action as string;
  
  validateBarcodeType(type);
  validateText(text);
  validateAction(action);
  validateOutputPath(args.outputPath, action);
  validateDimensions(args.width, args.height);
  validateScale(args.scale);
  validateRotation(args.rotate);

  const params = buildBarcodeParams(type, text, {
    width: args.width as number,
    height: args.height as number,
    scale: args.scale as number,
    includeText: args.includeText as boolean,
    rotate: args.rotate as string,
  });
  const chartUrl = buildBarcodeUrl(type, text);

  const result: any = {
    content: [
      {
        type: "text",
        text: "Below is the barcode URL:",
      },
      {
        type: "text",
        text: chartUrl,
      },
    ],
    metadata: {
      chartType: "barcode",
      generatedAt: new Date().toISOString(),
      chartUrl: chartUrl,
    },
  };

  try {
    const pngData = await fetchBarcodeContent(params, "png");
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
      text: "⚠️ Failed to fetch barcode image",
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

    const data = await fetchBarcodeContent(params, format);
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
      `Failed to save barcode: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
