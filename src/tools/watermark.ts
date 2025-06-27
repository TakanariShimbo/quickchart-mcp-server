import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { getDownloadPath } from "../utils/file.js";

const WATERMARK_URL = process.env.QUICKCHART_WATERMARK_URL || "https://quickchart.io/watermark";

export const CREATE_WATERMARK_TOOL: Tool = {
  name: "create-watermark",
  description: "Add watermarks/logos to images using QuickChart - get URL or save as file",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["get_url", "save_file"],
        description: "Whether to get watermarked image URL or save as file (default: get_url)",
      },
      outputPath: {
        type: "string",
        description: "Path where to save the file (only used with action=save_file)",
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
        enum: ["center", "top-left", "top-right", "bottom-left", "bottom-right"],
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
    required: ["mainImageUrl", "markImageUrl"],
  },
};

export function validateWatermarkUrls(mainImageUrl: string, markImageUrl: string): void {
  if (!mainImageUrl || typeof mainImageUrl !== "string" || mainImageUrl.trim().length === 0) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "MainImageUrl is required and must be a non-empty string"
    );
  }
  
  if (!markImageUrl || typeof markImageUrl !== "string" || markImageUrl.trim().length === 0) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "MarkImageUrl is required and must be a non-empty string"
    );
  }
}

export function buildWatermarkConfig(
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
  if (options.imageHeight !== undefined) config.imageHeight = options.imageHeight;
  if (options.markWidth !== undefined) config.markWidth = options.markWidth;
  if (options.markHeight !== undefined) config.markHeight = options.markHeight;
  if (options.markRatio !== undefined) config.markRatio = options.markRatio;
  if (options.position) config.position = options.position;
  if (options.positionX !== undefined) config.positionX = options.positionX;
  if (options.positionY !== undefined) config.positionY = options.positionY;
  if (options.margin !== undefined) config.margin = options.margin;

  return config;
}

export async function handleWatermarkTool(args: any): Promise<any> {
  validateWatermarkUrls(args.mainImageUrl as string, args.markImageUrl as string);
  
  const action = (args.action as string) || "get_url";
  
  const config = buildWatermarkConfig(
    args.mainImageUrl as string,
    args.markImageUrl as string,
    {
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
    }
  );

  if (action === "get_url") {
    return {
      content: [
        {
          type: "text",
          text: `POST to ${WATERMARK_URL}\nContent-Type: application/json\n\n${JSON.stringify(config, null, 2)}`,
        },
      ],
    };
  }

  if (action === "save_file") {
    const outputPath = getDownloadPath(args.outputPath as string | undefined, "png");

    try {
      const response = await axios.post(WATERMARK_URL, config, {
        responseType: "arraybuffer",
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(outputPath, response.data);

      return {
        content: [
          {
            type: "text",
            text: `Watermarked image saved successfully to: ${outputPath}`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to save watermarked image: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  throw new McpError(
    ErrorCode.InvalidParams,
    `Invalid action: ${action}. Use 'get_url' or 'save_file'`
  );
}