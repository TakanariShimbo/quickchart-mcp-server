import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { getDownloadPath } from "../utils/file.js";

const APEX_CHARTS_URL = process.env.QUICKCHART_APEXCHARTS_URL || "https://quickchart.io/apex-charts/render";

export const CREATE_APEXCHARTS_TOOL: Tool = {
  name: "create-apexcharts",
  description: "Create charts using Apex Charts - get URL or save as file",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["get_url", "save_file"],
        description: "Whether to get chart URL or save as file (default: get_url)",
      },
      outputPath: {
        type: "string",
        description: "Path where to save the file (only used with action=save_file)",
      },
      config: {
        type: "object",
        description: "Apex Charts JSON configuration",
      },
      width: {
        type: "integer",
        description: "Image width in pixels",
      },
      height: {
        type: "integer",
        description: "Image height in pixels",
      },
      apexChartsVersion: {
        type: "string",
        description: "Apex Charts version to use",
      },
    },
    required: ["config"],
  },
};

export function validateApexChartsConfig(config: any): void {
  if (!config || typeof config !== "object") {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Config is required and must be an object"
    );
  }
}

export function buildApexChartsConfig(
  config: any,
  options: {
    width?: number;
    height?: number;
    apexChartsVersion?: string;
  } = {}
): any {
  const payload: any = {
    config,
  };

  if (options.width !== undefined) payload.width = options.width;
  if (options.height !== undefined) payload.height = options.height;
  if (options.apexChartsVersion) payload.apexChartsVersion = options.apexChartsVersion;

  return payload;
}

export async function handleApexChartsTool(args: any): Promise<any> {
  validateApexChartsConfig(args.config);
  
  const action = (args.action as string) || "get_url";
  
  const apexConfig = buildApexChartsConfig(args.config, {
    width: args.width as number,
    height: args.height as number,
    apexChartsVersion: args.apexChartsVersion as string,
  });

  if (action === "get_url") {
    return {
      content: [
        {
          type: "text",
          text: `POST to ${APEX_CHARTS_URL}\nContent-Type: application/json\n\n${JSON.stringify(apexConfig, null, 2)}`,
        },
      ],
    };
  }

  if (action === "save_file") {
    const outputPath = getDownloadPath(args.outputPath as string | undefined, "png");

    try {
      const response = await axios.post(APEX_CHARTS_URL, apexConfig, {
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
            text: `Apex Charts image saved successfully to: ${outputPath}`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to save Apex Charts image: ${
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