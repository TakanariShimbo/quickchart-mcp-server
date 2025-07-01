import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { getDownloadPath } from "../utils/file.js";
import { QuickChartUrls } from "../utils/config.js";

/**
 * Tool description
 */
export const CREATE_TABLE_TOOL: Tool = {
  name: "create-table",
  description:
    "Create table images using QuickChart - get table image URL or save table image to file",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["get_url", "save_file"],
        description: "Whether to get table URL or save as file",
      },
      outputPath: {
        type: "string",
        description:
          "Path where to save the file (only used with action=save_file)",
      },
      data: {
        type: "object",
        description: "Table data with title, columns, and dataSource",
        properties: {
          title: {
            type: "string",
            description: "Table title",
          },
          columns: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "Column header title",
                },
                dataIndex: {
                  type: "string",
                  description: "Data property key",
                },
                width: {
                  type: "integer",
                  description: "Column width",
                },
                align: {
                  type: "string",
                  enum: ["left", "center", "right"],
                  description: "Text alignment",
                },
              },
              required: ["title", "dataIndex"],
            },
            description: "Column definitions",
          },
          dataSource: {
            type: "array",
            items: {
              type: "object",
              description:
                "Row data object with keys matching column dataIndex values",
            },
            description: "Table data rows",
          },
        },
        required: ["columns", "dataSource"],
      },
      options: {
        type: "object",
        description: "Table styling options",
        properties: {
          cellWidth: {
            type: "integer",
            description: "Cell width in pixels",
          },
          cellHeight: {
            type: "integer",
            description: "Cell height in pixels",
          },
          offsetLeft: {
            type: "integer",
            description: "Left offset in pixels",
          },
          offsetRight: {
            type: "integer",
            description: "Right offset in pixels",
          },
          fontFamily: {
            type: "string",
            description: "Font family",
          },
          backgroundColor: {
            type: "string",
            description: "Background color",
          },
          fontSize: {
            type: "integer",
            description: "Font size",
          },
          borderColor: {
            type: "string",
            description: "Border color",
          },
          headerColor: {
            type: "string",
            description: "Header background color",
          },
        },
      },
    },
    required: ["action", "data"],
  },
};

/**
 * Validates
 */
function validateTableData(data: any): void {
  if (!data || typeof data !== "object") {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Data is required and must be an object"
    );
  }

  if (
    !data.columns ||
    !Array.isArray(data.columns) ||
    data.columns.length === 0
  ) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Columns are required and must be a non-empty array"
    );
  }

  if (!data.dataSource || !Array.isArray(data.dataSource)) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "DataSource is required and must be an array"
    );
  }
}

function validateAction(action: string): void {
  if (!action || typeof action !== "string" || action.trim().length === 0) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Action must be a non-empty string"
    );
  }
  const validActions = ["get_url", "save_file"];
  if (!validActions.includes(action)) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid action: ${action}. Valid actions are: ${validActions.join(", ")}`
    );
  }
}

function validateOutputPath(
  outputPath: string | undefined,
  action: string
): void {
  if (
    action === "save_file" &&
    (!outputPath ||
      typeof outputPath !== "string" ||
      outputPath.trim().length === 0)
  ) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Output path is required for save_file action"
    );
  }
}

/**
 * Fetches
 */
function buildTableConfig(data: any, options: any = {}): any {
  const config: any = {
    data,
  };

  if (options && Object.keys(options).length > 0) {
    config.options = options;
  }

  return config;
}

function buildTableUrl(data: any): string {
  const dataJson = JSON.stringify(data);
  const encodedData = encodeURIComponent(dataJson);

  return `https://api.quickchart.io/v1/table?data=${encodedData}`;
}

async function fetchTableContent(postConfig: any): Promise<any> {
  const axiosConfig = {
    responseType: "arraybuffer" as any,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "image/*,*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
    },
    validateStatus: (status: number) => status >= 200 && status < 300,
  };

  try {
    const response = await axios.post(
      QuickChartUrls.table(),
      postConfig,
      axiosConfig
    );
    return response.data;
  } catch (error) {
    const axiosError = error as any;
    const message = axiosError.response
      ? `Failed to fetch table content from QuickChart - Status: ${axiosError.response.status}`
      : `Failed to fetch table content from QuickChart - ${axiosError.message}`;

    throw new McpError(ErrorCode.InternalError, message);
  }
}

/**
 * Tool handler
 */
export async function handleTableTool(args: any): Promise<any> {
  const data = args.data as any;
  const action = args.action as string;
  
  validateTableData(data);
  validateAction(action);
  validateOutputPath(args.outputPath, action);

  const config = buildTableConfig(data, args.options);
  const tableUrl = buildTableUrl(data);

  const result: any = {
    content: [
      {
        type: "text",
        text: "Below is the table URL:",
      },
      {
        type: "text",
        text: tableUrl,
      },
    ],
    metadata: {
      tableType: "data",
      generatedAt: new Date().toISOString(),
      tableUrl: tableUrl,
    },
  };

  let pngData: any = null;
  try {
    pngData = await fetchTableContent(config);
    const pngBase64 = Buffer.from(pngData).toString("base64");

    result.content.push(
      {
        type: "text",
        text: "Below is the PNG image:",
      },
      {
        type: "image",
        data: pngBase64,
        mimeType: "image/png",
      }
    );
    result.metadata.pngBase64 = pngBase64;
  } catch (error) {
    result.content.unshift({
      type: "text",
      text: "⚠️ Failed to fetch table image",
    });
    result.content.push({
      type: "text",
      text: `Error: ${error instanceof Error ? error.message : String(error)}`,
    });
    result.metadata.error =
      error instanceof Error ? error.message : String(error);
  }

  if (action === "get_url") {
    return result;
  }

  const outputPath = getDownloadPath(
    args.outputPath as string | undefined,
    "png"
  );

  try {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // If pngData is null, fetch it again for file saving
    const dataToSave = pngData || await fetchTableContent(config);
    fs.writeFileSync(outputPath, dataToSave);

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
      `Failed to save table image: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
