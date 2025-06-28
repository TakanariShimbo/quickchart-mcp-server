import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { getDownloadPath } from "../utils/file.js";
import { QuickChartUrls } from "../utils/config.js";

export const CREATE_CHART_USING_NATURAL_LANGUAGE_TOOL: Tool = {
  name: "create-chart-using-natural-language",
  description:
    "Create charts from natural language descriptions - get URL or save as file",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["get_url", "save_file"],
        description:
          "Whether to get chart URL or save as file (default: get_url)",
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
    required: ["description"],
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

export async function handleTextChartTool(args: any): Promise<any> {
  validateTextChartDescription(args.description as string);

  const action = (args.action as string) || "get_url";

  const config = buildTextChartConfig(args.description as string, {
    width: args.width as number,
    height: args.height as number,
    backgroundColor: args.backgroundColor as string,
    data1: args.data1 as string,
    data2: args.data2 as string,
    labels: args.labels as string,
    title: args.title as string,
  });

  if (action === "get_url") {
    return {
      content: [
        {
          type: "text",
          text: `POST to ${QuickChartUrls.textChart()}\nContent-Type: application/json\n\n${JSON.stringify(
            config,
            null,
            2
          )}`,
        },
      ],
    };
  }

  if (action === "save_file") {
    const outputPath = getDownloadPath(
      args.outputPath as string | undefined,
      "png"
    );

    try {
      const response = await axios.post(QuickChartUrls.textChart(), config, {
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
            text: `Text-to-chart image saved successfully to: ${outputPath}`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to save text-to-chart image: ${
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
