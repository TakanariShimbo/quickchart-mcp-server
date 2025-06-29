import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { getDownloadPath } from "../utils/file.js";
import { QuickChartUrls } from "../utils/config.js";

export const CREATE_CHART_USING_APEXCHARTS_TOOL: Tool = {
  name: "create-chart-using-apexcharts",
  description: "Create charts using Apex Charts - get chart image URL or save chart image to file",
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

async function fetchApexChartsContent(
  postConfig: any,
  format: string = "png"
): Promise<any> {
  try {
    const response = await axios.post(QuickChartUrls.apexCharts(), postConfig, {
      responseType: "arraybuffer",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    return response.data;
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to fetch ApexCharts content: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

function generateApexChartsUrls(postConfig: any): {
  chartUrl: string;
} {
  // Use only the config part for URL (not width/height/version)
  const configOnly = postConfig.config;
  const configOnlyJson = JSON.stringify(configOnly);
  const encodedConfigOnly = encodeURIComponent(configOnlyJson);
  
  return {
    chartUrl: `https://quickchart.io/apex-charts/render?config=${encodedConfigOnly}`,
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

  const postConfig = prepareApexChartsConfig(args.config, args);
  const { chartUrl } = generateApexChartsUrls(postConfig);

  // Generate PNG image for display
  const pngData = await fetchApexChartsContent(postConfig, "png");
  const pngBase64 = Buffer.from(pngData).toString("base64");

  const result: any = {
    content: [
      {
        type: "text",
        text: "Below is the chart URL:",
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
      chartType: args.config?.chart?.type || "unknown",
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

    const data = await fetchApexChartsContent(postConfig, format);
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
      `Failed to save chart: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
