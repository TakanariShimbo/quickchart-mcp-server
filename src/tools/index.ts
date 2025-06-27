import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { CREATE_CHART_USING_CHARTJS_TOOL, handleChartTool } from "./chart.js";
import { CREATE_WORDCLOUD_TOOL, handleWordCloudTool } from "./wordcloud.js";
import { CREATE_CHART_USING_APEXCHARTS_TOOL, handleApexChartsTool } from "./apexcharts.js";
import { CREATE_BARCODE_TOOL, handleBarcodeTool } from "./barcode.js";
import { CREATE_CHART_USING_GOOGLECHARTS_TOOL, handleGoogleChartsTool } from "./googlecharts.js";
import { CREATE_DIAGRAM_USING_GRAPHVIZ_TOOL, handleGraphvizTool } from "./graphviz.js";
import { CREATE_SPARKLINE_USING_CHARTJS_TOOL, handleSparklineTool } from "./sparkline.js";
import { CREATE_TABLE_TOOL, handleTableTool } from "./table.js";
import { CREATE_CHART_USING_NATURAL_LANGUAGE_TOOL, handleTextChartTool } from "./textchart.js";
import { CREATE_WATERMARK_TOOL, handleWatermarkTool } from "./watermark.js";

// Export all tools
export const TOOLS: Tool[] = [
  CREATE_CHART_USING_CHARTJS_TOOL,
  CREATE_CHART_USING_APEXCHARTS_TOOL,
  CREATE_CHART_USING_GOOGLECHARTS_TOOL,
  CREATE_CHART_USING_NATURAL_LANGUAGE_TOOL,
  CREATE_SPARKLINE_USING_CHARTJS_TOOL,
  CREATE_DIAGRAM_USING_GRAPHVIZ_TOOL,
  CREATE_WORDCLOUD_TOOL,
  CREATE_BARCODE_TOOL,
  CREATE_TABLE_TOOL,
  CREATE_WATERMARK_TOOL,
];

// Tool handler mapping
export const TOOL_HANDLERS: Record<string, (args: any) => Promise<any>> = {
  "create-chart-using-chartjs": handleChartTool,
  "create-chart-using-apexcharts": handleApexChartsTool,
  "create-chart-using-googlecharts": handleGoogleChartsTool,
  "create-chart-using-natural-language": handleTextChartTool,
  "create-sparkline-using-chartjs": handleSparklineTool,
  "create-diagram-using-graphviz": handleGraphvizTool,
  "create-wordcloud": handleWordCloudTool,
  "create-barcode": handleBarcodeTool,
  "create-table": handleTableTool,
  "create-watermark": handleWatermarkTool,
};

// Export individual tools for convenience
export { 
  CREATE_CHART_USING_CHARTJS_TOOL, 
  CREATE_CHART_USING_APEXCHARTS_TOOL,
  CREATE_CHART_USING_GOOGLECHARTS_TOOL,
  CREATE_CHART_USING_NATURAL_LANGUAGE_TOOL,
  CREATE_SPARKLINE_USING_CHARTJS_TOOL,
  CREATE_DIAGRAM_USING_GRAPHVIZ_TOOL,
  CREATE_WORDCLOUD_TOOL,
  CREATE_BARCODE_TOOL,
  CREATE_TABLE_TOOL,
  CREATE_WATERMARK_TOOL,
};