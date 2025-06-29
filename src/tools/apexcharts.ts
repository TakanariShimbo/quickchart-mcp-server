import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { getDownloadPath } from "../utils/file.js";
import { QuickChartUrls } from "../utils/config.js";

export const CREATE_CHART_USING_APEXCHARTS_TOOL: Tool = {
  name: "create-chart-using-apexcharts",
  description: "Create charts using Apex Charts - get URL or save as file",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["get_url", "save_file"],
        description:
          "Whether to get chart URL or save as file",
      },
      outputPath: {
        type: "string",
        description:
          "Path where to save the file (only used with action=save_file)",
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
    required: ["action", "config"],
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
  if (options.apexChartsVersion)
    payload.apexChartsVersion = options.apexChartsVersion;

  return payload;
}

function prepareApexChartsConfig(config: any, args: any): any {
  return buildApexChartsConfig(config, {
    width: args.width as number,
    height: args.height as number,
    apexChartsVersion: args.apexChartsVersion as string,
  });
}

function generateApexChartsUrls(postConfig: any): {
  apexchartsUrl: string;
} {
  const configJson = JSON.stringify(postConfig);
  const encodedConfig = encodeURIComponent(configJson);
  
  return {
    apexchartsUrl: `https://quickchart.io/apex-charts/render?config=${encodedConfig}`
  };
}

export async function handleApexChartsTool(args: any): Promise<any> {
  validateApexChartsConfig(args.config);

  const action = args.action as string;
  if (action !== "get_url" && action !== "save_file") {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid action: ${action}. Use 'get_url' or 'save_file'`
    );
  }

  const apexConfig = prepareApexChartsConfig(args.config, args);
  const { apexchartsUrl } = generateApexChartsUrls(apexConfig);

  if (action === "get_url") {
    return {
      content: [
        {
          type: "text",
          text: apexchartsUrl,
        },
      ],
      metadata: {
        apexchartsType: args.config?.chart?.type || "unknown",
        generatedAt: new Date().toISOString(),
        apexchartsUrl: apexchartsUrl,
      },
    };
  }

  const outputPath = getDownloadPath(
    args.outputPath as string | undefined,
    "png"
  );

  try {
    const response = await axios.post(
      QuickChartUrls.apexCharts(),
      apexConfig,
      {
        responseType: "arraybuffer",
        timeout: 30000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, response.data);

    return {
      content: [
        {
          type: "text",
          text: apexchartsUrl,
        },
      ],
      metadata: {
        apexchartsType: args.config?.chart?.type || "unknown",
        generatedAt: new Date().toISOString(),
        savedPath: outputPath,
        apexchartsUrl: apexchartsUrl,
      },
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
