import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { CREATE_CHART_USING_CHARTJS_TOOL, handleChartTool } from "./chart.js";
import { CREATE_WORDCLOUD_TOOL, handleWordCloudTool } from "./wordcloud.js";

// Export all tools
export const TOOLS: Tool[] = [
  CREATE_CHART_USING_CHARTJS_TOOL,
  CREATE_WORDCLOUD_TOOL,
];

// Tool handler mapping
export const TOOL_HANDLERS: Record<string, (args: any) => Promise<any>> = {
  "create-chart-using-chartjs": handleChartTool,
  "create-wordcloud": handleWordCloudTool,
};

// Export individual tools for convenience
export { CREATE_CHART_USING_CHARTJS_TOOL, CREATE_WORDCLOUD_TOOL };