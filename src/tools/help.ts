import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

// Tool documentation data extracted from README
const TOOL_DOCUMENTATION = {
  "create-chart-using-chartjs": {
    name: "create-chart-using-chartjs",
    description:
      "Create charts using Chart.js and QuickChart.io - get URL or save as file",
    documentation: "https://quickchart.io/documentation/",
    supportedChartTypes: [
      "bar - Bar charts for comparing values across categories",
      "line - Line charts for showing trends over time",
      "pie - Pie charts for showing proportions and percentages",
      "doughnut - Doughnut charts (pie chart with hollow center)",
      "radar - Radar charts for comparing multiple variables",
      "polarArea - Polar area charts for cyclical data visualization",
      "scatter - Scatter plots for correlation analysis",
      "bubble - Bubble charts for three-dimensional data relationships",
      "area - Area charts for showing cumulative values over time",
      "mixed - Mixed charts combining multiple chart types",
    ],
    promptExamples: [
      'Sales Reports: "Create a bar chart showing monthly sales data"',
      'Performance Metrics: "Generate a gauge chart showing our 85% performance score"',
      'Trend Analysis: "Show quarterly revenue growth as a line chart"',
      'Data Comparison: "Compare product performance across regions using a pie chart"',
      'Statistical Analysis: "Create a scatter plot to show the relationship between price and sales"',
    ],
    usageExample: {
      action: "save_file",
      chart: {
        type: "bar",
        data: {
          labels: ["Q1", "Q2", "Q3", "Q4"],
          datasets: [
            {
              label: "Sales 2024",
              data: [65, 59, 80, 81],
              backgroundColor: "rgba(54, 162, 235, 0.8)",
            },
          ],
        },
      },
    },
  },
  "create-chart-using-apexcharts": {
    name: "create-chart-using-apexcharts",
    description:
      "Create charts using ApexCharts library - get URL or save as file",
    documentation:
      "https://quickchart.io/documentation/apex-charts-image-rendering/",
    supportedChartTypes: [
      "line - Line charts for depicting trends and behaviors over time",
      "area - Area charts for showing cumulative data trends",
      "bar - Bar charts for categorical data comparison",
      "column - Column charts for vertical data comparison",
      "pie - Pie charts for proportion visualization",
      "donut - Donut charts for enhanced proportion display",
      "scatter - Scatter plots for correlation analysis",
      "bubble - Bubble charts for multi-dimensional data",
      "candlestick - Candlestick charts for financial data",
      "boxplot - Box plots for statistical data distribution",
      "heatmap - Heat maps for matrix data visualization",
      "treemap - Tree maps for hierarchical data",
      "radar - Radar charts for multi-variable comparison",
      "radialbar - Radial bar charts and circular gauges",
      "rangearea - Range area charts for data ranges",
      "rangebar - Range bar charts for time periods",
      "funnel - Funnel charts for process visualization",
    ],
    promptExamples: [
      'Financial Dashboards: "Create a candlestick chart for stock prices"',
      'Interactive Reports: "Generate a multi-series area chart with zoom functionality"',
      'Time Series Analysis: "Show real-time data with datetime axis charts"',
    ],
    usageExample: {
      action: "save_file",
      config: {
        series: [
          {
            name: "Sales",
            data: [30, 40, 45, 50, 49, 60, 70, 91],
          },
        ],
        chart: {
          type: "line",
        },
        xaxis: {
          categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
        },
      },
    },
  },
  "create-chart-using-googlecharts": {
    name: "create-chart-using-googlecharts",
    description:
      "Create charts using Google Charts library - get URL or save as file",
    documentation:
      "https://quickchart.io/documentation/google-charts-image-server/",
    supportedChartTypes: [
      "bar - Bar charts for category data comparison",
      "column - Column charts for vertical data comparison",
      "line - Line charts for trend visualization",
      "area - Area charts and stepped area charts",
      "pie - Pie charts for proportion display",
      "donut - Donut charts for enhanced proportion visualization",
      "scatter - Scatter charts for correlation analysis",
      "bubble - Bubble charts for multi-dimensional data",
      "combo - Combo charts combining multiple chart types",
      "gauge - Gauge charts for measurement and target values",
      "timeline - Timeline charts for time-series events",
      "gantt - Gantt charts for project management",
      "geochart - Geographic charts and world maps",
      "treemap - Tree map charts for hierarchical data",
      "sankey - Sankey diagrams for flow visualization",
      "candlestick - Candlestick charts for financial data",
      "histogram - Histograms for data distribution",
      "calendar - Calendar charts for date-based data",
      "org - Organizational charts for hierarchy display",
      "table - Table charts for structured data display",
      "waterfall - Waterfall charts for cumulative effects",
      "annotation - Annotation charts for detailed analysis",
    ],
    promptExamples: [
      'Geographic Data: "Create a world map showing sales by country"',
      'Organizational Charts: "Generate a company hierarchy diagram"',
      'Timeline Visualizations: "Show project milestones on a timeline chart"',
    ],
    usageExample: {
      action: "get_url",
      code: "const data = google.visualization.arrayToDataTable([['Task', 'Hours'], ['Work', 8], ['Sleep', 8], ['Eat', 2], ['Commute', 2], ['Watch TV', 4]]); const chart = new google.visualization.PieChart(document.getElementById('chart')); chart.draw(data);",
      packages: ["corechart"],
    },
  },
  "create-chart-using-natural-language": {
    name: "create-chart-using-natural-language",
    description:
      "Generate charts from natural language descriptions - get URL or save as file",
    documentation: "https://quickchart.io/documentation/apis/text-to-chart/",
    mainFeatures: [
      'Natural Language Analysis: Understands descriptions like "blue line chart showing monthly sales"',
      "Automatic Chart Selection: Determines optimal chart type automatically",
      "Data Integration: Automatic processing of CSV format data",
      "Style Application: Automatic optimization of colors, fonts, and layout",
    ],
    promptExamples: [
      'Quick Prototyping: "Show monthly revenue growth as a blue line chart"',
      'Data Exploration: "Create a chart that best represents this sales data"',
      'Automated Reporting: "Generate appropriate visualization from CSV data"',
    ],
    usageExample: {
      action: "save_file",
      description: "Show monthly revenue growth as a blue line chart",
      data1: "100,120,150,180,200",
      labels: "Jan,Feb,Mar,Apr,May",
      title: "Revenue Growth",
    },
  },
  "create-sparkline-using-chartjs": {
    name: "create-sparkline-using-chartjs",
    description: "Create compact sparkline charts - get URL or save as file",
    documentation: "https://quickchart.io/documentation/sparkline-api/",
    supportedChartTypes: [
      "line - Single line sparklines for trend visualization",
      "multiline - Multiple line sparklines for comparison",
    ],
    keyFeatures: [
      "Compact Design: Small charts embeddable in dashboards and reports",
      "Customizable Styling: Adjustable colors, line thickness, and point styles",
      "Fill Options: Optional area fill under lines",
      "Line Properties: Configurable tension, dash patterns, and point radius",
      "Multiple Series: Support for multiple data series in one sparkline",
    ],
    promptExamples: [
      'Dashboard Widgets: "Generate small trend indicators for KPI dashboard"',
      'Inline Metrics: "Create mini charts for email reports"',
      'Mobile Displays: "Show compact data trends for mobile apps"',
    ],
    usageExample: {
      action: "save_file",
      config: {
        type: "line",
        data: {
          datasets: [
            {
              data: [10, 15, 12, 18, 22, 20, 25],
              borderColor: "blue",
              pointRadius: 0,
            },
          ],
        },
      },
      width: 200,
      height: 50,
    },
  },
  "create-diagram-using-graphviz": {
    name: "create-diagram-using-graphviz",
    description:
      "Create graph diagrams using GraphViz - get URL or save as file",
    documentation: "https://quickchart.io/documentation/graphviz-api/",
    whatYouCanCreate: [
      "Flowcharts: Step-by-step process diagrams with decision points",
      "Organizational Charts: Company hierarchy and reporting structures",
      "Network Diagrams: System architecture and infrastructure maps",
      "Decision Trees: Logic flow and decision-making processes",
      "ER Diagrams: Database schema and relationships",
      "State Machines: System state transitions and workflows",
      "Mind Maps: Concept mapping and brainstorming diagrams",
      "Dependency Graphs: Project dependencies and task relationships",
      "System Architecture: Software component interactions",
      "Data Flow Diagrams: Information flow through systems",
    ],
    supportedLayoutAlgorithms: [
      "dot: Hierarchical graphs (flowcharts, org charts)",
      "neato: Undirected graphs (network diagrams)",
      "fdp: Force-directed model layouts",
      "circo: Circular layouts (cycle diagrams)",
      "twopi: Radial layouts (hub-and-spoke diagrams)",
    ],
    promptExamples: [
      'Workflow Documentation: "Generate a flowchart showing our approval process"',
      'System Architecture: "Create a network diagram of our infrastructure"',
      'Decision Trees: "Map out the customer onboarding decision flow"',
    ],
    usageExample: {
      action: "get_url",
      graph:
        'digraph G { Start -> Process -> Decision; Decision -> End [label="Yes"]; Decision -> Process [label="No"]; }',
      layout: "dot",
    },
  },
  "create-wordcloud": {
    name: "create-wordcloud",
    description: "Create word cloud visualizations - get URL or save as file",
    documentation: "https://quickchart.io/documentation/word-cloud-api/",
    promptExamples: [
      'Content Analysis: "Create a word cloud from customer feedback"',
      'Survey Results: "Visualize most common responses in survey data"',
      'Social Media Analytics: "Show trending keywords from social posts"',
    ],
    usageExample: {
      action: "get_url",
      text: "innovation technology artificial intelligence machine learning data science",
      width: 800,
      height: 400,
      backgroundColor: "#f0f0f0",
    },
  },
  "create-barcode": {
    name: "create-barcode",
    description: "Generate barcodes and QR codes - get URL or save as file",
    documentation: "https://quickchart.io/documentation/barcode-api/",
    supportedBarcodeTypes: [
      "QR Code: High-density 2D barcode for URLs, text, and data",
      "Code 128: Versatile 1D barcode for alphanumeric content",
      "EAN-13/UPC-A: Standard retail product identification",
      "Data Matrix: Compact 2D barcode for small items",
      "PDF417: High-capacity 2D barcode for documents",
      "Aztec: Compact 2D barcode with built-in error correction",
    ],
    whatYouCanCreate: [
      "Product Management: UPC-A and EAN-13 codes for retail products",
      "Inventory Management: Code 128 barcodes for warehouse tracking",
      "Shipping Labels: Generate tracking codes for logistics",
      "Document Encoding: PDF417 codes for storing large amounts of data",
      "Asset Tracking: Data Matrix codes for equipment and tools",
      "Mobile Applications: QR codes for app downloads and links",
      "Contact Information: QR codes containing vCard data",
      "Event Tickets: Secure barcodes for entry validation",
      "Payment Processing: QR codes for mobile payments",
      "Location Sharing: QR codes with GPS coordinates",
      "WiFi Access: QR codes for network credentials",
      "Promotional Campaigns: QR codes linking to special offers",
    ],
    promptExamples: [
      'Inventory Management: "Generate product barcodes for warehouse system"',
      'Retail Operations: "Create UPC codes for new product lines"',
      'Asset Tracking: "Generate Code128 barcodes for equipment tracking"',
    ],
    usageExample: {
      action: "get_url",
      type: "code128",
      text: "ABC123456789",
      width: 300,
      height: 100,
    },
  },
  "create-table": {
    name: "create-table",
    description: "Convert data to table images - get URL or save as file",
    documentation: "https://quickchart.io/documentation/apis/table-image-api/",
    promptExamples: [
      'Financial Reports: "Convert quarterly earnings data into professional table"',
      'Comparison Charts: "Create feature comparison table for products"',
      'Summary Reports: "Generate formatted tables for executive presentations"',
    ],
    usageExample: {
      action: "save_file",
      data: {
        title: "Q4 Sales Report",
        columns: [
          { title: "Product", dataIndex: "product" },
          { title: "Revenue", dataIndex: "revenue" },
        ],
        dataSource: [
          { product: "Product A", revenue: "$50,000" },
          { product: "Product B", revenue: "$75,000" },
        ],
      },
    },
  },
  "create-qr-code": {
    name: "create-qr-code",
    description:
      "Create QR codes with extensive customization options - get URL or save as file",
    documentation: "https://quickchart.io/documentation/qr-codes/",
    whatYouCanCreate: [
      "Website Links: Direct links to websites, landing pages, and online content",
      "Contact Information: vCard data for easy contact sharing",
      "WiFi Access: Network credentials for guest access",
      "Event Details: Calendar events, meeting information, and RSVP links",
      "App Downloads: Direct links to app stores and download pages",
      "Payment Information: Payment links and cryptocurrency addresses",
      "Location Sharing: GPS coordinates and map links",
      "Social Media: Profile links and social media connections",
      "Product Information: Item details, specifications, and reviews",
      "Marketing Campaigns: Promotional links and special offers",
      "Business Cards: Digital business card information",
      "Menu Access: Restaurant menus and ordering systems",
      "Document Sharing: Links to PDFs, forms, and downloads",
      "Survey Links: Research questionnaires and feedback forms",
    ],
    promptExamples: [
      'Marketing Campaigns: "Create QR codes linking to product pages"',
      'Event Management: "Generate QR codes for ticket verification"',
      'Contact Sharing: "Create QR codes containing business card information"',
      'WiFi Access: "Generate QR codes for guest network access"',
    ],
    usageExample: {
      action: "save_file",
      text: "https://example.com",
      size: 300,
      centerImageUrl: "https://example.com/logo.png",
      centerImageSizeRatio: 0.2,
      caption: "Visit our website",
    },
  },
  "create-watermark": {
    name: "create-watermark",
    description: "Add watermarks and logos to images - get URL or save as file",
    documentation: "https://quickchart.io/documentation/watermark-api/",
    promptExamples: [
      'Document Protection: "Add company logo watermark to reports"',
      'Brand Consistency: "Apply watermarks to all marketing materials"',
      'Copyright Protection: "Add attribution to shared visualizations"',
    ],
    usageExample: {
      action: "save_file",
      mainImageUrl: "https://example.com/chart.png",
      watermarkImageUrl: "https://example.com/logo.png",
      position: "bottom-right",
      opacity: 0.7,
    },
  },
};

export const GET_VISUALIZATION_TOOL_HELP_TOOL: Tool = {
  name: "get-visualization-tool-help",
  description:
    "Get detailed usage information and examples for all available chart, diagram, and QR code tools",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
};

export async function handleGetVisualizationToolHelpTool(
  args: any
): Promise<any> {
  try {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(TOOL_DOCUMENTATION, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Error getting visualization tools help: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
