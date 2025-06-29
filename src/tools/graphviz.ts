import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { getDownloadPath } from "../utils/file.js";
import { QuickChartUrls } from "../utils/config.js";

export const CREATE_DIAGRAM_USING_GRAPHVIZ_TOOL: Tool = {
  name: "create-diagram-using-graphviz",
  description: "Create graph diagrams using GraphViz - get diagram image URL or save diagram image to file",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["get_url", "save_file"],
        description:
          "Whether to get graph URL or save as file",
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

export function validateGraphvizGraph(graph: string): void {
  if (!graph || typeof graph !== "string" || graph.trim().length === 0) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Graph is required and must be a non-empty string"
    );
  }
}

export function buildGraphvizConfig(
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

function prepareGraphvizConfig(graph: string, args: any): any {
  return buildGraphvizConfig(graph, {
    layout: args.layout as string,
    format: args.format as string,
    width: args.width as number,
    height: args.height as number,
  });
}

function generateGraphvizUrls(postConfig: any): {
  graphvizUrl: string;
} {
  const configJson = JSON.stringify(postConfig);
  const encodedConfig = encodeURIComponent(configJson);
  
  return {
    graphvizUrl: `https://quickchart.io/graphviz?config=${encodedConfig}`
  };
}

export async function handleGraphvizTool(args: any): Promise<any> {
  validateGraphvizGraph(args.graph as string);

  const action = args.action as string;
  if (action !== "get_url" && action !== "save_file") {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid action: ${action}. Use 'get_url' or 'save_file'`
    );
  }

  const format = (args.format as string) || "svg";
  const config = prepareGraphvizConfig(args.graph as string, args);
  const { graphvizUrl } = generateGraphvizUrls(config);

  if (action === "get_url") {
    return {
      content: [
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
  }

  const outputPath = getDownloadPath(
    args.outputPath as string | undefined,
    format
  );

  try {
    const responseType = format === "svg" ? "text" : "arraybuffer";
    const response = await axios.post(QuickChartUrls.graphviz(), config, {
      responseType: responseType as any,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (format === "svg") {
      fs.writeFileSync(outputPath, response.data, "utf8");
    } else {
      fs.writeFileSync(outputPath, response.data);
    }

    return {
      content: [
        {
          type: "text",
          text: graphvizUrl,
        },
      ],
      metadata: {
        graphvizType: args.layout || "dot",
        generatedAt: new Date().toISOString(),
        savedPath: outputPath,
        graphvizUrl: graphvizUrl,
      },
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to save GraphViz diagram: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
