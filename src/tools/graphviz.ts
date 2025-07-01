import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { getDownloadPath } from "../utils/file.js";
import { QuickChartUrls } from "../utils/config.js";

/**
 * Tool description
 */
export const CREATE_DIAGRAM_USING_GRAPHVIZ_TOOL: Tool = {
  name: "create-diagram-using-graphviz",
  description:
    "Create graph diagrams using GraphViz - get diagram image URL or save diagram image to file",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["get_url", "save_file"],
        description: "Whether to get graph URL or save as file",
      },
      outputPath: {
        type: "string",
        description:
          "Path where to save the file (only used with action=save_file)",
      },
      graph: {
        type: "string",
        description: "DOT graph description",
      },
      layout: {
        type: "string",
        enum: ["dot", "fdp", "neato", "circo", "twopi", "osage", "patchwork"],
        description: "Graph layout algorithm (default: dot)",
      },
      format: {
        type: "string",
        enum: ["svg", "png"],
        description: "Output format (default: svg)",
      },
      width: {
        type: "integer",
        description: "Image width in pixels",
      },
      height: {
        type: "integer",
        description: "Image height in pixels",
      },
    },
    required: ["action", "graph"],
  },
};

/**
 * Validates
 */
function validateGraph(graph: string): void {
  if (!graph || typeof graph !== "string" || graph.trim().length === 0) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Graph is required and must be a non-empty string"
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

function validateLayout(layout?: string): void {
  if (layout !== undefined) {
    const validLayouts = ["dot", "fdp", "neato", "circo", "twopi", "osage", "patchwork"];
    if (!validLayouts.includes(layout)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid layout: ${layout}. Valid layouts are: ${validLayouts.join(", ")}`
      );
    }
  }
}

function validateFormat(format?: string): void {
  if (format !== undefined) {
    const validFormats = ["svg", "png"];
    if (!validFormats.includes(format)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid format: ${format}. Valid formats are: ${validFormats.join(", ")}`
      );
    }
  }
}

function validateDimensions(width?: number, height?: number): void {
  if (width !== undefined) {
    if (!Number.isInteger(width) || width <= 0 || width > 10000) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Width must be a positive integer between 1 and 10000"
      );
    }
  }
  if (height !== undefined) {
    if (!Number.isInteger(height) || height <= 0 || height > 10000) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Height must be a positive integer between 1 and 10000"
      );
    }
  }
}

/**
 * Fetches
 */
function buildGraphvizConfig(
  graph: string,
  options: {
    layout?: string;
    format?: string;
    width?: number;
    height?: number;
  } = {}
): any {
  const config: any = {
    graph,
    layout: options.layout || "dot",
    format: options.format || "svg",
  };

  if (options.width !== undefined) config.width = options.width;
  if (options.height !== undefined) config.height = options.height;

  return config;
}

function buildGraphvizUrl(graph: string, layout: string = "dot", format: string = "svg"): string {
  const encodedGraph = encodeURIComponent(graph);

  return `https://quickchart.io/graphviz?graph=${encodedGraph}&layout=${layout}&format=${format}`;
}

async function fetchGraphvizContent(
  postConfig: any,
  format: string = "png"
): Promise<any> {
  const config = { ...postConfig, format };
  const isSvg = format === "svg";
  const axiosConfig = {
    responseType: (isSvg ? "text" : "arraybuffer") as any,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: isSvg ? "image/svg+xml,*/*" : "image/*,*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
    },
    validateStatus: (status: number) => status >= 200 && status < 300,
  };

  try {
    const response = await axios.post(
      QuickChartUrls.graphviz(),
      config,
      axiosConfig
    );
    return response.data;
  } catch (error) {
    const axiosError = error as any;
    const message = axiosError.response
      ? `Failed to fetch GraphViz content from QuickChart - Status: ${axiosError.response.status}`
      : `Failed to fetch GraphViz content from QuickChart - ${axiosError.message}`;

    throw new McpError(ErrorCode.InternalError, message);
  }
}

/**
 * Tool handler
 */
export async function handleGraphvizTool(args: any): Promise<any> {
  const graph = args.graph as string;
  const action = args.action as string;
  
  validateGraph(graph);
  validateAction(action);
  validateOutputPath(args.outputPath, action);
  validateLayout(args.layout);
  validateFormat(args.format);
  validateDimensions(args.width, args.height);

  const config = buildGraphvizConfig(graph, {
    layout: args.layout as string,
    format: args.format as string,
    width: args.width as number,
    height: args.height as number,
  });
  const graphvizUrl = buildGraphvizUrl(
    graph,
    args.layout as string || "dot",
    args.format as string || "svg"
  );

  const result: any = {
    content: [
      {
        type: "text",
        text: "Below is the GraphViz diagram URL:",
      },
      {
        type: "text",
        text: graphvizUrl,
      },
    ],
    metadata: {
      graphvizType: args.layout || "dot",
      generatedAt: new Date().toISOString(),
      graphvizUrl: graphvizUrl,
    },
  };

  try {
    const pngData = await fetchGraphvizContent(config, "png");
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
      text: "⚠️ Failed to fetch diagram image",
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

  const format = (args.format as string) || "svg";
  const outputPath = getDownloadPath(
    args.outputPath as string | undefined,
    format
  );

  try {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const data = await fetchGraphvizContent(config, format);
    if (format === "svg") {
      fs.writeFileSync(outputPath, data, "utf8");
    } else {
      fs.writeFileSync(outputPath, data);
    }

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
      `Failed to save GraphViz diagram: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
