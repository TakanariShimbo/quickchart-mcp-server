#!/usr/bin/env node

/**
 * QuickChart MCP Server
 *
 * This server provides tools to generate charts and visualizations using QuickChart.io API.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";
import { TOOLS, TOOL_HANDLERS } from "./tools/index.js";

// Server Initialization
const server = new Server(
  {
    name: "quickchart-server",
    version: "0.6.2",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool List Handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

// Tool Call Handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const handler = TOOL_HANDLERS[name];
    
    if (!handler) {
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }

    if (!args) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Missing arguments for ${name}`
      );
    }

    return await handler(args);
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(
      ErrorCode.InternalError,
      `Error executing tool ${name}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
});

// Server Startup Function
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`QuickChart MCP Server running on stdio`);
  console.error(`Available tools: ${TOOLS.map(t => t.name).join(", ")}`);
}

// Server Execution
runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});