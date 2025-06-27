import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { CREATE_CHART_USING_CHARTJS_TOOL, handleChartTool } from "./chart.js";
import { CREATE_WORDCLOUD_TOOL, handleWordCloudTool } from "./wordcloud.js";
import { CREATE_APEXCHARTS_TOOL, handleApexChartsTool } from "./apexcharts.js";
import { CREATE_BARCODE_TOOL, handleBarcodeTool } from "./barcode.js";
import { CREATE_GOOGLECHARTS_TOOL, handleGoogleChartsTool } from "./googlecharts.js";
import { CREATE_GRAPHVIZ_TOOL, handleGraphvizTool } from "./graphviz.js";
import { CREATE_SPARKLINE_TOOL, handleSparklineTool } from "./sparkline.js";
import { CREATE_TABLE_TOOL, handleTableTool } from "./table.js";
import { CREATE_TEXTCHART_TOOL, handleTextChartTool } from "./textchart.js";
import { CREATE_WATERMARK_TOOL, handleWatermarkTool } from "./watermark.js";

// Export all tools
export const TOOLS: Tool[] = [
  CREATE_CHART_USING_CHARTJS_TOOL,
  CREATE_WORDCLOUD_TOOL,
  CREATE_APEXCHARTS_TOOL,
  CREATE_BARCODE_TOOL,
  CREATE_GOOGLECHARTS_TOOL,
  CREATE_GRAPHVIZ_TOOL,
  CREATE_SPARKLINE_TOOL,
  CREATE_TABLE_TOOL,
  CREATE_TEXTCHART_TOOL,
  CREATE_WATERMARK_TOOL,
];

// Tool handler mapping
export const TOOL_HANDLERS: Record<string, (args: any) => Promise<any>> = {
  "create-chart-using-chartjs": handleChartTool,
  "create-wordcloud": handleWordCloudTool,
  "create-apexcharts": handleApexChartsTool,
  "create-barcode": handleBarcodeTool,
  "create-googlecharts": handleGoogleChartsTool,
  "create-graphviz": handleGraphvizTool,
  "create-sparkline": handleSparklineTool,
  "create-table": handleTableTool,
  "create-textchart": handleTextChartTool,
  "create-watermark": handleWatermarkTool,
};

// Export individual tools for convenience
export { 
  CREATE_CHART_USING_CHARTJS_TOOL, 
  CREATE_WORDCLOUD_TOOL,
  CREATE_APEXCHARTS_TOOL,
  CREATE_BARCODE_TOOL,
  CREATE_GOOGLECHARTS_TOOL,
  CREATE_GRAPHVIZ_TOOL,
  CREATE_SPARKLINE_TOOL,
  CREATE_TABLE_TOOL,
  CREATE_TEXTCHART_TOOL,
  CREATE_WATERMARK_TOOL,
};