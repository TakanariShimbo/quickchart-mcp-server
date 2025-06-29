import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { getDownloadPath } from "../utils/file.js";
import { QuickChartUrls } from "../utils/config.js";

export const CREATE_CHART_USING_NATURAL_LANGUAGE_TOOL: Tool = {
  name: "create-chart-using-natural-language",
  description:
    "Create charts from natural language descriptions - get chart image URL or save chart image to file",
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
      description: {
        type: "string",
        description: "Natural language chart description",
      },
      width: {
        type: "integer",
        description: "Chart width in pixels",
      },
      height: {
        type: "integer",
        description: "Chart height in pixels",
      },
      backgroundColor: {
        type: "string",
        description: "Background color",
      },
      data1: {
        type: "string",
        description: "First dataset values (comma-separated)",
      },
      data2: {
        type: "string",
        description: "Second dataset values (comma-separated)",
      },
      labels: {
        type: "string",
        description: "Data labels (comma-separated)",
      },
      title: {
        type: "string",
        description: "Chart title",
      },
    },
    required: ["action", "description"],
  },
};

export function validateTextChartDescription(description: string): void {
  if (
    !description ||
    typeof description !== "string" ||
    description.trim().length === 0
  ) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Description is required and must be a non-empty string"
    );
  }
}

export function buildTextChartConfig(
  description: string,
  options: {
    width?: number;
    height?: number;
    backgroundColor?: string;
    data1?: string;
    data2?: string;
    labels?: string;
    title?: string;
  } = {}
): any {
  const config: any = {
    description,
  };

  if (options.width !== undefined) config.width = options.width;
  if (options.height !== undefined) config.height = options.height;
  if (options.backgroundColor) config.backgroundColor = options.backgroundColor;
  if (options.data1) config.data1 = options.data1;
  if (options.data2) config.data2 = options.data2;
  if (options.labels) config.labels = options.labels;
  if (options.title) config.title = options.title;

  return config;
}

function prepareTextChartConfig(description: string, args: any): any {
  return buildTextChartConfig(description, {
    width: args.width as number,
    height: args.height as number,
    backgroundColor: args.backgroundColor as string,
    data1: args.data1 as string,
    data2: args.data2 as string,
    labels: args.labels as string,
    title: args.title as string,
  });
}

async function fetchTextChartContent(
  postConfig: any,
  format: string = "png"
): Promise<any> {
  try {
    const response = await axios.post(QuickChartUrls.textChart(), postConfig, {
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
      `Failed to fetch text chart content: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

function generateTextChartUrls(postConfig: any): {
  chartUrl: string;
} {
  const description = postConfig.description;
  const encodedDescription = encodeURIComponent(description);

  return {
    chartUrl: `https://quickchart.io/natural/${encodedDescription}`,
  };
}

export async function handleTextChartTool(args: any): Promise<any> {
  validateTextChartDescription(args.description as string);

  const action = args.action as string;
  if (action !== "get_url" && action !== "save_file") {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid action: ${action}. Use 'get_url' or 'save_file'`
    );
  }

  const postConfig = prepareTextChartConfig(args.description as string, args);
  const { chartUrl } = generateTextChartUrls(postConfig);
  const pngData = await fetchTextChartContent(postConfig, "png");
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
      chartType: "natural-language",
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

    const data = await fetchTextChartContent(postConfig, format);
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
