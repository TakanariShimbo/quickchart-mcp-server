import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { getDownloadPath } from "../utils/file.js";
import { QuickChartUrls } from "../utils/config.js";

export const CREATE_TABLE_TOOL: Tool = {
  name: "create-table",
  description: "Create table images using QuickChart - get table image URL or save table image to file",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["get_url", "save_file"],
        description:
          "Whether to get table URL or save as file",
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

export function validateTableData(data: any): void {
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

export function buildTableConfig(data: any, options: any = {}): any {
  const config: any = {
    data,
  };

  if (options && Object.keys(options).length > 0) {
    config.options = options;
  }

  return config;
}

function prepareTableConfig(data: any, args: any): any {
  return buildTableConfig(data, args.options);
}

function generateTableUrls(postConfig: any): {
  tableUrl: string;
} {
  const configJson = JSON.stringify(postConfig);
  const encodedConfig = encodeURIComponent(configJson);
  
  return {
    tableUrl: `https://api.quickchart.io/v1/table?config=${encodedConfig}`
  };
}

export async function handleTableTool(args: any): Promise<any> {
  validateTableData(args.data);

  const action = args.action as string;
  if (action !== "get_url" && action !== "save_file") {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid action: ${action}. Use 'get_url' or 'save_file'`
    );
  }

  const config = prepareTableConfig(args.data, args);
  const { tableUrl } = generateTableUrls(config);

  if (action === "get_url") {
    return {
      content: [
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
  }

  const outputPath = getDownloadPath(
    args.outputPath as string | undefined,
    "png"
  );

  try {
    const response = await axios.post(QuickChartUrls.table(), config, {
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
          text: tableUrl,
        },
      ],
      metadata: {
        tableType: "data",
        generatedAt: new Date().toISOString(),
        savedPath: outputPath,
        tableUrl: tableUrl,
      },
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to save table image: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
