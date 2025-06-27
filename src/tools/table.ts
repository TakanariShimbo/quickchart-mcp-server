import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { getDownloadPath } from "../utils/file.js";

const TABLE_URL = process.env.QUICKCHART_TABLE_URL || "https://api.quickchart.io/v1/table";

export const CREATE_TABLE_TOOL: Tool = {
  name: "create-table",
  description: "Create table images using QuickChart - get URL or save as file",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["get_url", "save_file"],
        description: "Whether to get table URL or save as file (default: get_url)",
      },
      outputPath: {
        type: "string",
        description: "Path where to save the file (only used with action=save_file)",
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
              description: "Row data object with keys matching column dataIndex values",
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
    required: ["data"],
  },
};

export function validateTableData(data: any): void {
  if (!data || typeof data !== "object") {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Data is required and must be an object"
    );
  }
  
  if (!data.columns || !Array.isArray(data.columns) || data.columns.length === 0) {
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

export function buildTableConfig(
  data: any,
  options: any = {}
): any {
  const config: any = {
    data,
  };

  if (options && Object.keys(options).length > 0) {
    config.options = options;
  }

  return config;
}

export async function handleTableTool(args: any): Promise<any> {
  validateTableData(args.data);
  
  const action = (args.action as string) || "get_url";
  
  const config = buildTableConfig(args.data, args.options);

  if (action === "get_url") {
    return {
      content: [
        {
          type: "text",
          text: `POST to ${TABLE_URL}\nContent-Type: application/json\n\n${JSON.stringify(config, null, 2)}`,
        },
      ],
    };
  }

  if (action === "save_file") {
    const outputPath = getDownloadPath(args.outputPath as string | undefined, "png");

    try {
      const response = await axios.post(TABLE_URL, config, {
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
            text: `Table image saved successfully to: ${outputPath}`,
          },
        ],
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

  throw new McpError(
    ErrorCode.InvalidParams,
    `Invalid action: ${action}. Use 'get_url' or 'save_file'`
  );
}