import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { getDownloadPath } from "../utils/file.js";
import { QuickChartUrls } from "../utils/config.js";

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
        description:
          "Whether to get watermarked image URL or save as file",
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

export function validateWatermarkUrls(
  mainImageUrl: string,
  markImageUrl: string
): void {
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

function prepareWatermarkConfig(
  mainImageUrl: string,
  markImageUrl: string,
  args: any
): any {
  return buildWatermarkConfig(mainImageUrl, markImageUrl, {
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
}

function generateWatermarkUrls(postConfig: any): {
  watermarkUrl: string;
} {
  const configJson = JSON.stringify(postConfig);
  const encodedConfig = encodeURIComponent(configJson);
  
  return {
    watermarkUrl: `https://quickchart.io/watermark?config=${encodedConfig}`
  };
}

export async function handleWatermarkTool(args: any): Promise<any> {
  validateWatermarkUrls(
    args.mainImageUrl as string,
    args.markImageUrl as string
  );

  const action = args.action as string;
  if (action !== "get_url" && action !== "save_file") {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid action: ${action}. Use 'get_url' or 'save_file'`
    );
  }

  const config = prepareWatermarkConfig(
    args.mainImageUrl as string,
    args.markImageUrl as string,
    args
  );
  const { watermarkUrl } = generateWatermarkUrls(config);

  if (action === "get_url") {
    return {
      content: [
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
  }

  const outputPath = getDownloadPath(
    args.outputPath as string | undefined,
    "png"
  );

  try {
    const response = await axios.post(QuickChartUrls.watermark(), config, {
      responseType: "arraybuffer",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
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
          text: watermarkUrl,
        },
      ],
      metadata: {
        watermarkType: "image",
        generatedAt: new Date().toISOString(),
        savedPath: outputPath,
        watermarkUrl: watermarkUrl,
      },
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
