import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { getDownloadPath } from "../utils/file.js";
import { QuickChartUrls } from "../utils/config.js";

export const CREATE_QR_CODE_TOOL: Tool = {
  name: "create-qr-code",
  description: "Create QR codes using QuickChart - get QR code image URL or save QR code image to file",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["get_url", "save_file"],
        description:
          "Whether to get QR code URL or save as file",
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

export function validateQRCodeText(text: string): void {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Text is required and must be a non-empty string"
    );
  }
}

export function buildQRCodeParams(
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

function prepareQRCodeConfig(text: string, args: any): Record<string, string> {
  return buildQRCodeParams(text, {
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
}

async function fetchQRCodeContent(
  params: Record<string, string>,
  format: string = "png"
): Promise<any> {
  try {
    const queryString = new URLSearchParams(params).toString();
    const qrUrl = `${QuickChartUrls.qrCode()}?${queryString}`;
    
    const responseType = format === "svg" ? "text" : "arraybuffer";
    const response = await axios.get(qrUrl, {
      responseType: responseType as any,
      timeout: 30000,
    });
    
    return response.data;
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to fetch QR code content: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

function generateQRCodeUrls(params: Record<string, string>): {
  chartUrl: string;
} {
  // Use only the text for simple URL
  const text = decodeURIComponent(params.text);
  const encodedText = encodeURIComponent(text);
  
  return {
    chartUrl: `https://quickchart.io/qr?text=${encodedText}`,
  };
}

export async function handleQRCodeTool(args: any): Promise<any> {
  validateQRCodeText(args.text as string);

  const action = args.action as string;
  if (action !== "get_url" && action !== "save_file") {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid action: ${action}. Use 'get_url' or 'save_file'`
    );
  }

  const params = prepareQRCodeConfig(args.text as string, args);
  const { chartUrl } = generateQRCodeUrls(params);

  // Generate PNG image for display
  const pngData = await fetchQRCodeContent(params, "png");
  const pngBase64 = Buffer.from(pngData).toString("base64");

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
      chartType: "qrcode",
      generatedAt: new Date().toISOString(),
      chartUrl: chartUrl,
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

    const data = await fetchQRCodeContent(params, format);
    if (format === "svg") {
      fs.writeFileSync(outputPath, data, "utf8");
    } else {
      fs.writeFileSync(outputPath, data);
    }

    result.metadata.savedPath = outputPath;
    result.content.push({
      type: "text",
      text: "Below is the saved file path:"
    });
    result.content.push({
      type: "text", 
      text: outputPath
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
