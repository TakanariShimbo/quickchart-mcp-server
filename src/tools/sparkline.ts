import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { getDownloadPath } from "../utils/file.js";

const SPARKLINE_URL = process.env.QUICKCHART_SPARKLINE_URL || "https://quickchart.io/chart";

export const CREATE_SPARKLINE_USING_CHARTJS_TOOL: Tool = {
  name: "create-sparkline-using-chartjs",
  description: "Create sparkline charts using Chart.js - get URL or save as file",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["get_url", "save_file"],
        description: "Whether to get sparkline URL or save as file (default: get_url)",
      },
      outputPath: {
        type: "string",
        description: "Path where to save the file (only used with action=save_file)",
      },
      chart: {
        type: "object",
        description: "Chart.js configuration for sparkline",
      },
      width: {
        type: "integer",
        description: "Chart width in pixels (default: 100)",
      },
      height: {
        type: "integer",
        description: "Chart height in pixels (default: 30)",
      },
      devicePixelRatio: {
        type: "integer",
        enum: [1, 2],
        description: "Device pixel ratio (default: 2)",
      },
      backgroundColor: {
        type: "string",
        description: "Background color (default: transparent)",
      },
    },
    required: ["chart"],
  },
};

export function validateSparklineChart(chart: any): void {
  if (!chart || typeof chart !== "object") {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Chart configuration is required and must be an object"
    );
  }
}

export function buildSparklineParams(
  chart: any,
  options: {
    width?: number;
    height?: number;
    devicePixelRatio?: number;
    backgroundColor?: string;
  } = {}
): Record<string, string> {
  const params: Record<string, string> = {
    c: JSON.stringify(chart),
    w: (options.width || 100).toString(),
    h: (options.height || 30).toString(),
  };

  if (options.devicePixelRatio !== undefined) {
    params.devicePixelRatio = options.devicePixelRatio.toString();
  }
  if (options.backgroundColor) {
    params.bkg = options.backgroundColor;
  }

  return params;
}

export async function handleSparklineTool(args: any): Promise<any> {
  validateSparklineChart(args.chart);
  
  const action = (args.action as string) || "get_url";
  
  const params = buildSparklineParams(args.chart, {
    width: args.width as number,
    height: args.height as number,
    devicePixelRatio: args.devicePixelRatio as number,
    backgroundColor: args.backgroundColor as string,
  });

  const queryString = new URLSearchParams(params).toString();
  const fullUrl = `${SPARKLINE_URL}?${queryString}`;

  if (action === "get_url") {
    return {
      content: [
        {
          type: "text",
          text: `GET ${fullUrl}`,
        },
      ],
    };
  }

  if (action === "save_file") {
    const outputPath = getDownloadPath(args.outputPath as string | undefined, "png");

    try {
      const response = await axios.get(fullUrl, {
        responseType: "arraybuffer",
        timeout: 30000,
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
            text: `Sparkline chart saved successfully to: ${outputPath}`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to save sparkline chart: ${
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