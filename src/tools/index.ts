import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { isToolEnabled, ToolNames } from "../utils/config.js";
import { CREATE_CHART_USING_CHARTJS_TOOL, handleChartTool } from "./chart.js";
import { CREATE_WORDCLOUD_TOOL, handleWordCloudTool } from "./wordcloud.js";
import {
  CREATE_CHART_USING_APEXCHARTS_TOOL,
  handleApexChartsTool,
} from "./apexcharts.js";
import { CREATE_BARCODE_TOOL, handleBarcodeTool } from "./barcode.js";
import {
  CREATE_CHART_USING_GOOGLECHARTS_TOOL,
  handleGoogleChartsTool,
} from "./googlecharts.js";
import {
  CREATE_DIAGRAM_USING_GRAPHVIZ_TOOL,
  handleGraphvizTool,
} from "./graphviz.js";
import {
  CREATE_SPARKLINE_USING_CHARTJS_TOOL,
  handleSparklineTool,
} from "./sparkline.js";
import { CREATE_TABLE_TOOL, handleTableTool } from "./table.js";
import {
  CREATE_CHART_USING_NATURAL_LANGUAGE_TOOL,
  handleTextChartTool,
} from "./textchart.js";
import { CREATE_WATERMARK_TOOL, handleWatermarkTool } from "./watermark.js";
import { CREATE_QR_CODE_TOOL, handleQRCodeTool } from "./qrcode.js";
import {
  GET_VISUALIZATION_TOOL_HELP_TOOL,
  handleGetVisualizationToolHelpTool,
} from "./help.js";

// All available tools
const ALL_TOOLS: Array<{ tool: Tool; name: string }> = [
  { tool: CREATE_CHART_USING_CHARTJS_TOOL, name: ToolNames.CHART },
  { tool: CREATE_CHART_USING_APEXCHARTS_TOOL, name: ToolNames.APEXCHARTS },
  { tool: CREATE_CHART_USING_GOOGLECHARTS_TOOL, name: ToolNames.GOOGLECHARTS },
  { tool: CREATE_CHART_USING_NATURAL_LANGUAGE_TOOL, name: ToolNames.TEXTCHART },
  { tool: CREATE_SPARKLINE_USING_CHARTJS_TOOL, name: ToolNames.SPARKLINE },
  { tool: CREATE_DIAGRAM_USING_GRAPHVIZ_TOOL, name: ToolNames.GRAPHVIZ },
  { tool: CREATE_WORDCLOUD_TOOL, name: ToolNames.WORDCLOUD },
  { tool: CREATE_BARCODE_TOOL, name: ToolNames.BARCODE },
  { tool: CREATE_QR_CODE_TOOL, name: ToolNames.QRCODE },
  { tool: CREATE_TABLE_TOOL, name: ToolNames.TABLE },
  { tool: CREATE_WATERMARK_TOOL, name: ToolNames.WATERMARK },
  { tool: GET_VISUALIZATION_TOOL_HELP_TOOL, name: ToolNames.HELP },
];

// Export only enabled tools
export const TOOLS: Tool[] = ALL_TOOLS.filter(({ name }) =>
  isToolEnabled(name)
).map(({ tool }) => tool);

// Tool handler mapping (only includes enabled tools)
const ALL_TOOL_HANDLERS: Record<
  string,
  { handler: (args: any) => Promise<any>; toolName: string }
> = {
  "create-chart-using-chartjs": {
    handler: handleChartTool,
    toolName: ToolNames.CHART,
  },
  "create-chart-using-apexcharts": {
    handler: handleApexChartsTool,
    toolName: ToolNames.APEXCHARTS,
  },
  "create-chart-using-googlecharts": {
    handler: handleGoogleChartsTool,
    toolName: ToolNames.GOOGLECHARTS,
  },
  "create-chart-using-natural-language": {
    handler: handleTextChartTool,
    toolName: ToolNames.TEXTCHART,
  },
  "create-sparkline-using-chartjs": {
    handler: handleSparklineTool,
    toolName: ToolNames.SPARKLINE,
  },
  "create-diagram-using-graphviz": {
    handler: handleGraphvizTool,
    toolName: ToolNames.GRAPHVIZ,
  },
  "create-wordcloud": {
    handler: handleWordCloudTool,
    toolName: ToolNames.WORDCLOUD,
  },
  "create-barcode": { handler: handleBarcodeTool, toolName: ToolNames.BARCODE },
  "create-qr-code": { handler: handleQRCodeTool, toolName: ToolNames.QRCODE },
  "create-table": { handler: handleTableTool, toolName: ToolNames.TABLE },
  "create-watermark": {
    handler: handleWatermarkTool,
    toolName: ToolNames.WATERMARK,
  },
  "get-visualization-tool-help": {
    handler: handleGetVisualizationToolHelpTool,
    toolName: ToolNames.HELP,
  },
};

export const TOOL_HANDLERS: Record<string, (args: any) => Promise<any>> =
  Object.fromEntries(
    Object.entries(ALL_TOOL_HANDLERS)
      .filter(([, { toolName }]) => isToolEnabled(toolName))
      .map(([toolId, { handler }]) => [toolId, handler])
  );

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
  CREATE_QR_CODE_TOOL,
  CREATE_TABLE_TOOL,
  CREATE_WATERMARK_TOOL,
  GET_VISUALIZATION_TOOL_HELP_TOOL,
};
