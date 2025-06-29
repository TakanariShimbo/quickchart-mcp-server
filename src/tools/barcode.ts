import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { getDownloadPath } from "../utils/file.js";
import { QuickChartUrls } from "../utils/config.js";

export const CREATE_BARCODE_TOOL: Tool = {
  name: "create-barcode",
  description: "Create barcodes using QuickChart - get barcode image URL or save barcode image to file",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["get_url", "save_file"],
        description:
          "Whether to get barcode URL or save as file",
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

export function validateBarcodeParams(type: string, text: string): void {
  if (!type || typeof type !== "string" || type.trim().length === 0) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Type is required and must be a non-empty string"
    );
  }

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Text is required and must be a non-empty string"
    );
  }
}

export function buildBarcodeParams(
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

function prepareBarcodeConfig(type: string, text: string, args: any): Record<string, string> {
  return buildBarcodeParams(type, text, {
    width: args.width as number,
    height: args.height as number,
    scale: args.scale as number,
    includeText: args.includeText as boolean,
    rotate: args.rotate as string,
  });
}

async function fetchBarcodeContent(
  params: Record<string, string>,
  format: string = "png"
): Promise<any> {
  try {
    const queryString = new URLSearchParams(params).toString();
    const barcodeUrl = `${QuickChartUrls.barcode()}?${queryString}`;
    
    const response = await axios.get(barcodeUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
    });
    
    return response.data;
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to fetch barcode content: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

function generateBarcodeUrls(params: Record<string, string>): {
  chartUrl: string;
} {
  // Use only type and text for simple URL
  const simpleParams = new URLSearchParams({
    type: params.type,
    text: params.text
  }).toString();
  
  return {
    chartUrl: `https://quickchart.io/barcode?${simpleParams}`,
  };
}

export async function handleBarcodeTool(args: any): Promise<any> {
  validateBarcodeParams(args.type as string, args.text as string);

  const action = args.action as string;
  if (action !== "get_url" && action !== "save_file") {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid action: ${action}. Use 'get_url' or 'save_file'`
    );
  }

  const params = prepareBarcodeConfig(args.type as string, args.text as string, args);
  const { chartUrl } = generateBarcodeUrls(params);

  // Generate PNG image for display
  const pngData = await fetchBarcodeContent(params, "png");
  const pngBase64 = Buffer.from(pngData).toString("base64");

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
      chartType: "barcode",
      generatedAt: new Date().toISOString(),
      chartUrl: chartUrl,
      pngBase64: pngBase64,
    },
  };

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
      `Failed to save barcode: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
