import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { getDownloadPath } from "../utils/file.js";
import { QuickChartUrls } from "../utils/config.js";

export const CREATE_CHART_USING_GOOGLECHARTS_TOOL: Tool = {
  name: "create-chart-using-googlecharts",
  description:
    "Create charts using Google Charts - get chart image URL or save chart image to file",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["get_url", "save_file"],
        description: "Whether to get chart URL or save as file",
      },
      outputPath: {
        type: "string",
        description:
          "Path where to save the file (only used with action=save_file)",
      },
      code: {
        type: "string",
        description: "JavaScript drawChart function code",
      },
      packages: {
        type: "string",
        description: "Google Charts packages to load (default: 'corechart')",
      },
      width: {
        type: "integer",
        description: "Chart width in pixels",
      },
      height: {
        type: "integer",
        description: "Chart height in pixels",
      },
      mapsApiKey: {
        type: "string",
        description: "Google Maps API key (for geo charts)",
      },
    },
    required: ["action", "code"],
  },
};

export function validateGoogleChartsCode(code: string): void {
  if (!code || typeof code !== "string" || code.trim().length === 0) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Code is required and must be a non-empty string"
    );
  }
}

export function buildGoogleChartsConfig(
  code: string,
  options: {
    packages?: string;
    width?: number;
    height?: number;
    mapsApiKey?: string;
  } = {}
): any {
  const config: any = {
    code,
    packages: options.packages || "corechart",
  };

  if (options.width !== undefined) config.width = options.width;
  if (options.height !== undefined) config.height = options.height;
  if (options.mapsApiKey) config.mapsApiKey = options.mapsApiKey;

  return config;
}

function prepareGoogleChartsConfig(code: string, args: any): any {
  return buildGoogleChartsConfig(code, {
    packages: args.packages as string,
    width: args.width as number,
    height: args.height as number,
    mapsApiKey: args.mapsApiKey as string,
  });
}

async function fetchGoogleChartsContent(
  postConfig: any,
  format: string = "png"
): Promise<any> {
  try {
    const response = await axios.post(
      QuickChartUrls.googleCharts(),
      postConfig,
      {
        responseType: "arraybuffer",
        timeout: 30000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to fetch Google Charts content: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

function generateGoogleChartsUrls(postConfig: any): {
  chartUrl: string;
} {
  const codeOnly = postConfig.code;
  const encodedCodeOnly = encodeURIComponent(codeOnly);

  return {
    chartUrl: `https://quickchart.io/google-charts/render?code=${encodedCodeOnly}`,
  };
}

export async function handleGoogleChartsTool(args: any): Promise<any> {
  validateGoogleChartsCode(args.code as string);

  const action = args.action as string;
  if (action !== "get_url" && action !== "save_file") {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid action: ${action}. Use 'get_url' or 'save_file'`
    );
  }

  const postConfig = prepareGoogleChartsConfig(args.code as string, args);
  const { chartUrl } = generateGoogleChartsUrls(postConfig);
  const pngData = await fetchGoogleChartsContent(postConfig, "png");
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
      chartType: args.packages || "corechart",
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

    const data = await fetchGoogleChartsContent(postConfig, format);
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
      `Failed to save chart: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
