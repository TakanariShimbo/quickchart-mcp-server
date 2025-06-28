[English](README.md) | [日本語](README_ja.md) | **README**

# QuickChart MCP Server

## Overview

This Model Context Protocol (MCP) server provides powerful visualization tools using QuickChart.io APIs.  
With this MCP, AI assistants can create charts, diagrams, barcodes, QR codes, word clouds, tables, and more.

**Example prompts:**

- "I need a chart showing our Q4 sales by region"
- "Create a QR code for our contact information"
- "Generate a professional table from this CSV data"
- "Make a word cloud from these customer reviews"
- "Draw a flowchart of our deployment process"

**The AI will:**

1. Choose the right tool for your request
2. Structure the data appropriately
3. Apply suitable styling and formatting
4. Save or display the result as needed

### Output Options

**Get URLs:** Perfect for sharing, embedding in web pages, or quick previews  
**Save Files:** Ideal for reports, presentations, or archival purposes

**Supported Formats:**

- **Images**: PNG, JPEG, WebP, SVG
- **Documents**: PDF
- **Data**: Base64 encoding

**File Management:**

- Files are saved to your Desktop by default
- Custom paths supported for organization
- Automatic directory creation when needed

## Installation

### Via Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "quickchart": {
      "command": "npx",
      "args": ["-y", "@takanarishimbo/quickchart-mcp-server"]
    }
  }
}
```

### With Custom QuickChart Instance

```json
{
  "mcpServers": {
    "quickchart": {
      "command": "npx",
      "args": ["-y", "@takanarishimbo/quickchart-mcp-server"],
      "env": {
        "QUICKCHART_BASE_URL": "https://your-quickchart-instance.com",
        "QUICKCHART_ENABLE_QRCODE": "false"
      }
    }
  }
}
```

#### Environment Variables

**Environment Variables:**

**URL Configuration:**

- **QUICKCHART_BASE_URL**: Main QuickChart API base URL (default: `https://quickchart.io`)
- **QUICKCHART_API_BASE_URL**: QuickChart API server base URL (default: `https://api.quickchart.io`)

Setting `QUICKCHART_BASE_URL` will configure these endpoints:

- Charts: `{BASE_URL}/chart`
- QR Codes: `{BASE_URL}/qr`
- Word Clouds: `{BASE_URL}/wordcloud`
- ApexCharts: `{BASE_URL}/apex-charts/render`
- Google Charts: `{BASE_URL}/google-charts/render`
- Barcodes: `{BASE_URL}/barcode`
- GraphViz: `{BASE_URL}/graphviz`
- Text-to-Chart: `{BASE_URL}/natural`
- Watermarks: `{BASE_URL}/watermark`

Setting `QUICKCHART_API_BASE_URL` will configure these endpoints:

- Tables: `{API_BASE_URL}/v1/table`

**Tool Disable Settings:**
To disable specific tools, set these environment variables to `false`:

- **QUICKCHART_ENABLE_CHART**: Chart.js chart tool
- **QUICKCHART_ENABLE_APEXCHARTS**: ApexCharts tool
- **QUICKCHART_ENABLE_GOOGLECHARTS**: Google Charts tool
- **QUICKCHART_ENABLE_TEXTCHART**: Text-to-chart tool
- **QUICKCHART_ENABLE_SPARKLINE**: Sparkline tool
- **QUICKCHART_ENABLE_GRAPHVIZ**: GraphViz tool
- **QUICKCHART_ENABLE_WORDCLOUD**: Word cloud tool
- **QUICKCHART_ENABLE_BARCODE**: Barcode tool
- **QUICKCHART_ENABLE_QRCODE**: QR code tool
- **QUICKCHART_ENABLE_TABLE**: Table tool
- **QUICKCHART_ENABLE_WATERMARK**: Watermark tool
- **QUICKCHART_ENABLE_HELP**: Visualization tool help

## Tools

### `create-chart-using-chartjs`

Create charts using Chart.js and QuickChart.io - get URL or save as file

**Documentation**: [QuickChart.io Chart API](https://quickchart.io/documentation/)

- **Input**: Action (get_url/save_file), outputPath, dimensions (integers), format options, encoding method, and Chart.js configuration object
- **Output**: Chart URL or confirmation message with saved file path

**Supported Chart Types:**

- **bar**: Bar charts for comparing values across categories
- **line**: Line charts for showing trends over time  
- **pie**: Pie charts for showing proportions and percentages
- **doughnut**: Doughnut charts (pie chart with hollow center)
- **radar**: Radar charts for comparing multiple variables
- **polarArea**: Polar area charts for cyclical data visualization
- **scatter**: Scatter plots for correlation analysis
- **bubble**: Bubble charts for three-dimensional data relationships
- **area**: Area charts for showing cumulative values over time
- **mixed**: Mixed charts combining multiple chart types

**Prompt Examples:**

- **Sales Reports**: "Create a bar chart showing monthly sales data"
- **Performance Metrics**: "Generate a gauge chart showing our 85% performance score"
- **Trend Analysis**: "Show quarterly revenue growth as a line chart"
- **Data Comparison**: "Compare product performance across regions using a pie chart"
- **Statistical Analysis**: "Create a scatter plot to show the relationship between price and sales"

**Usage Examples for AI:**

```json
{
  "action": "save_file",
  "chart": {
    "type": "bar",
    "data": {
      "labels": ["Q1", "Q2", "Q3", "Q4"],
      "datasets": [
        {
          "label": "Sales 2024",
          "data": [65, 59, 80, 81],
          "backgroundColor": "rgba(54, 162, 235, 0.8)"
        }
      ]
    }
  }
}
```

### `create-chart-using-apexcharts`

Create charts using ApexCharts library - get URL or save as file

**Documentation**: [ApexCharts Image Rendering](https://quickchart.io/documentation/apex-charts-image-rendering/)

- **Input**: Action (get_url/save_file), outputPath, ApexCharts configuration, dimensions, and version options
- **Output**: ApexCharts URL or confirmation message with saved file path

**Supported Chart Types:**

- **line**: Line charts for depicting trends and behaviors over time
- **area**: Area charts for showing cumulative data trends
- **bar**: Bar charts for categorical data comparison
- **column**: Column charts for vertical data comparison
- **pie**: Pie charts for proportion visualization
- **donut**: Donut charts for enhanced proportion display
- **scatter**: Scatter plots for correlation analysis
- **bubble**: Bubble charts for multi-dimensional data
- **candlestick**: Candlestick charts for financial data
- **boxplot**: Box plots for statistical data distribution
- **heatmap**: Heat maps for matrix data visualization
- **treemap**: Tree maps for hierarchical data
- **radar**: Radar charts for multi-variable comparison
- **radialbar**: Radial bar charts and circular gauges
- **rangearea**: Range area charts for data ranges
- **rangebar**: Range bar charts for time periods
- **funnel**: Funnel charts for process visualization

**Prompt Examples:**

- **Financial Dashboards**: "Create a candlestick chart for stock prices"
- **Interactive Reports**: "Generate a multi-series area chart with zoom functionality"
- **Time Series Analysis**: "Show real-time data with datetime axis charts"

**Usage Examples for AI:**

```json
{
  "action": "save_file",
  "config": {
    "series": [
      {
        "name": "Sales",
        "data": [30, 40, 45, 50, 49, 60, 70, 91]
      }
    ],
    "chart": {
      "type": "line"
    },
    "xaxis": {
      "categories": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"]
    }
  }
}
```

### `create-chart-using-googlecharts`

Create charts using Google Charts library - get URL or save as file

**Documentation**: [Google Charts Image Server](https://quickchart.io/documentation/google-charts-image-server/)

- **Input**: Action (get_url/save_file), outputPath, JavaScript drawing code, packages, dimensions, and API keys
- **Output**: Google Charts URL or confirmation message with saved file path

**Supported Chart Types:**

- **bar**: Bar charts for category data comparison
- **column**: Column charts for vertical data comparison
- **line**: Line charts for trend visualization
- **area**: Area charts and stepped area charts
- **pie**: Pie charts for proportion display
- **donut**: Donut charts for enhanced proportion visualization
- **scatter**: Scatter charts for correlation analysis
- **bubble**: Bubble charts for multi-dimensional data
- **combo**: Combo charts combining multiple chart types
- **gauge**: Gauge charts for measurement and target values
- **timeline**: Timeline charts for time-series events
- **gantt**: Gantt charts for project management
- **geochart**: Geographic charts and world maps
- **treemap**: Tree map charts for hierarchical data
- **sankey**: Sankey diagrams for flow visualization
- **candlestick**: Candlestick charts for financial data
- **histogram**: Histograms for data distribution
- **calendar**: Calendar charts for date-based data
- **org**: Organizational charts for hierarchy display
- **table**: Table charts for structured data display
- **waterfall**: Waterfall charts for cumulative effects
- **annotation**: Annotation charts for detailed analysis

**Prompt Examples:**

- **Geographic Data**: "Create a world map showing sales by country"
- **Organizational Charts**: "Generate a company hierarchy diagram"
- **Timeline Visualizations**: "Show project milestones on a timeline chart"

**Usage Examples for AI:**

```json
{
  "action": "get_url",
  "code": "const data = google.visualization.arrayToDataTable([['Task', 'Hours'], ['Work', 8], ['Sleep', 8], ['Eat', 2], ['Commute', 2], ['Watch TV', 4]]); const chart = new google.visualization.PieChart(document.getElementById('chart')); chart.draw(data);",
  "packages": ["corechart"]
}
```

### `create-chart-using-natural-language`

Generate charts from natural language descriptions - get URL or save as file

**Documentation**: [Text to Chart API](https://quickchart.io/documentation/apis/text-to-chart/)

- **Input**: Action (get_url/save_file), outputPath, natural language description, data values, and chart options
- **Output**: AI-generated chart URL or confirmation message with saved file path

**Main Features:**

- **Natural Language Analysis**: Understands descriptions like "blue line chart showing monthly sales"
- **Automatic Chart Selection**: Determines optimal chart type automatically
- **Data Integration**: Automatic processing of CSV format data
- **Style Application**: Automatic optimization of colors, fonts, and layout

**Prompt Examples:**

- **Quick Prototyping**: "Show monthly revenue growth as a blue line chart"
- **Data Exploration**: "Create a chart that best represents this sales data"
- **Automated Reporting**: "Generate appropriate visualization from CSV data"

**Usage Examples for AI:**

```json
{
  "action": "save_file",
  "description": "Show monthly revenue growth as a blue line chart",
  "data1": "100,120,150,180,200",
  "labels": "Jan,Feb,Mar,Apr,May",
  "title": "Revenue Growth"
}
```

### `create-sparkline-using-chartjs`

Create compact sparkline charts - get URL or save as file

**Documentation**: [Sparkline API](https://quickchart.io/documentation/sparkline-api/)

- **Input**: Action (get_url/save_file), outputPath, Chart.js configuration, dimensions, and display options
- **Output**: Sparkline URL or confirmation message with saved file path

**Supported Chart Types:**

- **line**: Single line sparklines for trend visualization
- **multiline**: Multiple line sparklines for comparison

**Key Features:**

- **Compact Design**: Small charts embeddable in dashboards and reports
- **Customizable Styling**: Adjustable colors, line thickness, and point styles
- **Fill Options**: Optional area fill under lines
- **Line Properties**: Configurable tension, dash patterns, and point radius
- **Multiple Series**: Support for multiple data series in one sparkline

**Prompt Examples:**

- **Dashboard Widgets**: "Generate small trend indicators for KPI dashboard"
- **Inline Metrics**: "Create mini charts for email reports"
- **Mobile Displays**: "Show compact data trends for mobile apps"

**Usage Examples for AI:**

```json
{
  "action": "save_file",
  "config": {
    "type": "line",
    "data": {
      "datasets": [
        {
          "data": [10, 15, 12, 18, 22, 20, 25],
          "borderColor": "blue",
          "pointRadius": 0
        }
      ]
    }
  },
  "width": 200,
  "height": 50
}
```

### `create-diagram-using-graphviz`

Create graph diagrams using GraphViz - get URL or save as file

**Documentation**: [GraphViz API](https://quickchart.io/documentation/graphviz-api/)

- **Input**: Action (get_url/save_file), outputPath, DOT graph description, layout algorithm, format, and dimensions
- **Output**: GraphViz diagram URL or confirmation message with saved file path

**What You Can Create:**

- **Flowcharts**: Step-by-step process diagrams with decision points
- **Organizational Charts**: Company hierarchy and reporting structures
- **Network Diagrams**: System architecture and infrastructure maps
- **Decision Trees**: Logic flow and decision-making processes
- **ER Diagrams**: Database schema and relationships
- **State Machines**: System state transitions and workflows
- **Mind Maps**: Concept mapping and brainstorming diagrams
- **Dependency Graphs**: Project dependencies and task relationships
- **System Architecture**: Software component interactions
- **Data Flow Diagrams**: Information flow through systems

**Prompt Examples:**

- **Workflow Documentation**: "Generate a flowchart showing our approval process"
- **System Architecture**: "Create a network diagram of our infrastructure"
- **Decision Trees**: "Map out the customer onboarding decision flow"

**Supported Layout Algorithms:**

- **dot**: Hierarchical graphs (flowcharts, org charts)
- **neato**: Undirected graphs (network diagrams)
- **fdp**: Force-directed model layouts
- **circo**: Circular layouts (cycle diagrams)
- **twopi**: Radial layouts (hub-and-spoke diagrams)

**Prompt Examples:**

- **Workflow Documentation**: "Generate a flowchart showing our approval process"
- **System Architecture**: "Create a network diagram of our infrastructure"
- **Decision Trees**: "Map out the customer onboarding decision flow"

**Usage Examples for AI:**

```json
{
  "action": "get_url",
  "graph": "digraph G { Start -> Process -> Decision; Decision -> End [label=\"Yes\"]; Decision -> Process [label=\"No\"]; }",
  "layout": "dot"
}
```

### `create-wordcloud`

Create word cloud visualizations - get URL or save as file

**Documentation**: [Word Cloud API](https://quickchart.io/documentation/word-cloud-api/)

- **Input**: Action (get_url/save_file), outputPath, text content, fonts, colors, and layout options
- **Output**: Word cloud URL or confirmation message with saved file path

**Prompt Examples:**

- **Content Analysis**: "Create a word cloud from customer feedback"
- **Survey Results**: "Visualize most common responses in survey data"
- **Social Media Analytics**: "Show trending keywords from social posts"

**Prompt Examples:**

- **Content Analysis**: "Create a word cloud from customer feedback"
- **Survey Results**: "Visualize most common responses in survey data"
- **Social Media Analytics**: "Show trending keywords from social posts"

**Usage Examples for AI:**

```json
{
  "action": "get_url",
  "text": "innovation technology artificial intelligence machine learning data science",
  "width": 800,
  "height": 400,
  "backgroundColor": "#f0f0f0"
}
```

### `create-barcode`

Generate barcodes and QR codes - get URL or save as file

**Documentation**: [Barcode API](https://quickchart.io/documentation/barcode-api/)

- **Input**: Action (get_url/save_file), outputPath, barcode type, text data, dimensions, and formatting options
- **Output**: Barcode URL or confirmation message with saved file path

**Supported Barcode Types (100+ formats):**

- **QR Code**: High-density 2D barcode for URLs, text, and data
- **Code 128**: Versatile 1D barcode for alphanumeric content
- **EAN-13/UPC-A**: Standard retail product identification
- **Data Matrix**: Compact 2D barcode for small items
- **PDF417**: High-capacity 2D barcode for documents
- **Aztec**: Compact 2D barcode with built-in error correction

**What You Can Create:**

- **Product Management**: UPC-A and EAN-13 codes for retail products
- **Inventory Management**: Code 128 barcodes for warehouse tracking
- **Shipping Labels**: Generate tracking codes for logistics
- **Document Encoding**: PDF417 codes for storing large amounts of data
- **Asset Tracking**: Data Matrix codes for equipment and tools
- **Mobile Applications**: QR codes for app downloads and links
- **Contact Information**: QR codes containing vCard data
- **Event Tickets**: Secure barcodes for entry validation
- **Payment Processing**: QR codes for mobile payments
- **Location Sharing**: QR codes with GPS coordinates
- **WiFi Access**: QR codes for network credentials
- **Promotional Campaigns**: QR codes linking to special offers

**Prompt Examples:**

- **Inventory Management**: "Generate product barcodes for warehouse system"
- **Retail Operations**: "Create UPC codes for new product lines"
- **Asset Tracking**: "Generate Code128 barcodes for equipment tracking"

**Prompt Examples:**

- **Inventory Management**: "Generate product barcodes for warehouse system"
- **Retail Operations**: "Create UPC codes for new product lines"
- **Asset Tracking**: "Generate Code128 barcodes for equipment tracking"

**Usage Examples for AI:**

```json
{
  "action": "get_url",
  "type": "code128",
  "text": "ABC123456789",
  "width": 300,
  "height": 100
}
```

### `create-table`

Convert data to table images - get URL or save as file

**Documentation**: [Table Image API](https://quickchart.io/documentation/apis/table-image-api/)

- **Input**: Action (get_url/save_file), outputPath, table data structure, column definitions, and styling options
- **Output**: Table image URL or confirmation message with saved file path

**Prompt Examples:**

- **Financial Reports**: "Convert quarterly earnings data into professional table"
- **Comparison Charts**: "Create feature comparison table for products"
- **Summary Reports**: "Generate formatted tables for executive presentations"

**Prompt Examples:**

- **Financial Reports**: "Convert quarterly earnings data into professional table"
- **Comparison Charts**: "Create feature comparison table for products"
- **Summary Reports**: "Generate formatted tables for executive presentations"

**Usage Examples for AI:**

```json
{
  "action": "save_file",
  "data": {
    "title": "Q4 Sales Report",
    "columns": [
      { "title": "Product", "dataIndex": "product" },
      { "title": "Revenue", "dataIndex": "revenue" }
    ],
    "dataSource": [
      { "product": "Product A", "revenue": "$50,000" },
      { "product": "Product B", "revenue": "$75,000" }
    ]
  }
}
```

### `create-qr-code`

Create QR codes with extensive customization options - get URL or save as file

**Documentation**: [QR Code API](https://quickchart.io/documentation/qr-codes/)

- **Input**: Action (get_url/save_file), outputPath, text content, format options, size, colors, error correction level, and advanced customization
- **Output**: QR code URL or confirmation message with saved file path

**What You Can Create:**

- **Website Links**: Direct links to websites, landing pages, and online content
- **Contact Information**: vCard data for easy contact sharing
- **WiFi Access**: Network credentials for guest access
- **Event Details**: Calendar events, meeting information, and RSVP links
- **App Downloads**: Direct links to app stores and download pages
- **Payment Information**: Payment links and cryptocurrency addresses
- **Location Sharing**: GPS coordinates and map links
- **Social Media**: Profile links and social media connections
- **Product Information**: Item details, specifications, and reviews
- **Marketing Campaigns**: Promotional links and special offers
- **Business Cards**: Digital business card information
- **Menu Access**: Restaurant menus and ordering systems
- **Document Sharing**: Links to PDFs, forms, and downloads
- **Survey Links**: Research questionnaires and feedback forms

**Prompt Examples:**

- **Marketing Campaigns**: "Create QR codes linking to product pages"
- **Event Management**: "Generate QR codes for ticket verification"
- **Contact Sharing**: "Create QR codes containing business card information"
- **WiFi Access**: "Generate QR codes for guest network access"

**Prompt Examples:**

- **Marketing Campaigns**: "Create QR codes linking to product pages"
- **Event Management**: "Generate QR codes for ticket verification"
- **Contact Sharing**: "Create QR codes containing business card information"
- **WiFi Access**: "Generate QR codes for guest network access"

**Usage Examples for AI:**

```json
{
  "action": "save_file",
  "text": "https://example.com",
  "size": 300,
  "centerImageUrl": "https://example.com/logo.png",
  "centerImageSizeRatio": 0.2,
  "caption": "Visit our website"
}
```

### `create-watermark`

Add watermarks and logos to images - get URL or save as file

**Documentation**: [Watermark API](https://quickchart.io/documentation/watermark-api/)

- **Input**: Action (get_url/save_file), outputPath, main image URL, watermark image URL, positioning, and opacity options
- **Output**: Watermarked image URL or confirmation message with saved file path

**Prompt Examples:**

- **Document Protection**: "Add company logo watermark to reports"
- **Brand Consistency**: "Apply watermarks to all marketing materials"
- **Copyright Protection**: "Add attribution to shared visualizations"

**Prompt Examples:**

- **Document Protection**: "Add company logo watermark to reports"
- **Brand Consistency**: "Apply watermarks to all marketing materials"
- **Copyright Protection**: "Add attribution to shared visualizations"

**Usage Examples for AI:**

```json
{
  "action": "save_file",
  "mainImageUrl": "https://example.com/chart.png",
  "watermarkImageUrl": "https://example.com/logo.png",
  "position": "bottom-right",
  "opacity": 0.7
}
```

### `get-visualization-tool-help`

Get detailed usage information and examples for all available chart, diagram, and QR code tools

- **Input**: No parameters required
- **Output**: Complete documentation for all visualization tools in JSON format

**Usage Examples for AI:**

```json
{}
```

This tool provides comprehensive information about all available tools including:
- Supported chart types and features
- Prompt examples for each tool
- Detailed usage examples with JSON configuration
- Official documentation links
- What you can create with each tool

## Development

1. **Clone this repository**

   ```bash
   git clone https://github.com/TakanariShimbo/quickchart-mcp-server.git
   cd quickchart-mcp-server
   ```

2. **Install dependencies**

   ```bash
   npm ci
   ```

3. **Build the project**

   ```bash
   npm run build
   ```

4. **Test with MCP Inspector (optional)**

   ```bash
   npx @modelcontextprotocol/inspector node dist/index.js
   ```

## Publishing to NPM

This project includes automated NPM publishing via GitHub Actions. To set up publishing:

### 1. Create NPM Access Token

1. **Log in to NPM** (create account if needed)

   ```bash
   npm login
   ```

2. **Create Access Token**
   - Go to [https://www.npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens)
   - Click "Generate New Token"
   - Select "Automation" (for CI/CD usage)
   - Choose "Publish" permission level
   - Copy the generated token (starts with `npm_`)

### 2. Add Token to GitHub Repository

1. **Navigate to Repository Settings**

   - Go to your GitHub repository
   - Click "Settings" tab
   - Go to "Secrets and variables" → "Actions"

2. **Add NPM Token**
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste your NPM token from step 1
   - Click "Add secret"

### 3. Setup GitHub Personal Access Token (for release script)

The release script needs to push to GitHub, so you'll need a GitHub token:

1. **Create GitHub Personal Access Token**

   - Go to [https://github.com/settings/tokens](https://github.com/settings/tokens)
   - Click "Generate new token" → "Generate new token (classic)"
   - Set expiration (recommended: 90 days or custom)
   - Select scopes:
     - ✅ `repo` (Full control of private repositories)
   - Click "Generate token"
   - Copy the generated token (starts with `ghp_`)

2. **Configure Git with Token**

   ```bash
   # Option 1: Use GitHub CLI (recommended)
   gh auth login

   # Option 2: Configure git to use token
   git config --global credential.helper store

   # Then when prompted for password, use your token instead
   ```

### 4. Release New Version

Use the included release script to automatically version, tag, and trigger publishing:

```bash
# Increment patch version (0.1.0 → 0.1.1)
npm run release patch

# Increment minor version (0.1.0 → 0.2.0)
npm run release minor

# Increment major version (0.1.0 → 1.0.0)
npm run release major

# Set specific version
npm run release 1.2.3
```

### 5. Verify Publication

1. **Check GitHub Actions**

   - Go to "Actions" tab in your repository
   - Verify the "Publish to npm" workflow completed successfully

2. **Verify NPM Package**
   - Visit: `https://www.npmjs.com/package/@takanarishimbo/quickchart-mcp-server`
   - Or run: `npm view @takanarishimbo/quickchart-mcp-server`

### Release Process Flow

1. `release.sh` script updates version in all files
2. Creates git commit and tag
3. Pushes to GitHub
4. GitHub Actions workflow triggers on new tag
5. Workflow builds project and publishes to NPM
6. Package becomes available globally via `npm install`

## Project Structure

```
quickchart-mcp-server/
├── src/
│   ├── index.ts          # Main server implementation
│   ├── tools/
│   │   ├── index.ts      # Tool registry and exports
│   │   ├── chart.ts      # Chart.js tool
│   │   ├── wordcloud.ts  # Word cloud tool
│   │   ├── apexcharts.ts # ApexCharts tool
│   │   ├── barcode.ts    # Barcode/QR tool
│   │   ├── googlecharts.ts # Google Charts tool
│   │   ├── graphviz.ts   # GraphViz tool
│   │   ├── sparkline.ts  # Sparkline tool
│   │   ├── table.ts      # Table image tool
│   │   ├── textchart.ts  # Text-to-chart tool
│   │   ├── watermark.ts  # Watermark tool
│   │   └── qrcode.ts     # QR code tool
│   └── utils/
│       └── file.ts       # File utilities
├── package.json          # Package configuration
├── package-lock.json
├── tsconfig.json         # TypeScript configuration
├── .github/
│   └── workflows/
│       └── npm-publish.yml   # NPM publish workflow
├── scripts/
│   └── release.sh        # Release automation script
├── docs/
│   ├── README.md         # This file
│   └── README_ja.md      # Japanese documentation
└── .gitignore            # Git ignore file
```

## Resources

### Official Documentation

#### QuickChart API

- [QuickChart Main Documentation](https://quickchart.io/documentation/) - Comprehensive guide to all QuickChart APIs

#### Chart Libraries

- [Chart.js Documentation](https://www.chartjs.org/docs/latest/) - Popular JavaScript charting library
- [ApexCharts Documentation](https://apexcharts.com/docs/) - Modern charting library
- [Google Charts Documentation](https://developers.google.com/chart) - Google's visualization API
- [GraphViz Documentation](https://graphviz.org/documentation/) - Graph visualization software

#### MCP Protocol

- [Model Context Protocol](https://modelcontextprotocol.io/) - Official MCP specification
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/typescript-sdk) - TypeScript SDK for MCP
- [Claude Desktop MCP Guide](https://docs.anthropic.com/en/docs/build-with-claude/mcp) - Using MCP with Claude
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector) - Debug and test MCP servers

### Tutorials & Examples

#### Getting Started

- [QuickChart Gallery](https://quickchart.io/gallery/) - Chart examples and inspiration
- [Chart.js Examples](https://www.chartjs.org/docs/latest/samples/) - Interactive chart examples
- [ApexCharts Demos](https://apexcharts.com/javascript-chart-demos/) - Live chart demonstrations
- [GraphViz Gallery](https://graphviz.org/gallery/) - Graph visualization examples

#### Advanced Usage

- [Chart.js Configuration](https://www.chartjs.org/docs/latest/configuration/) - Detailed configuration options
- [DOT Language Guide](https://graphviz.org/doc/info/lang.html) - GraphViz syntax reference
- [QR Code Best Practices](https://blog.qr4.nl/post/qr-code-best-practices/) - QR code design guidelines
- [Data Visualization Guidelines](https://www.data-to-viz.com/) - Choosing the right chart type

#### Development Tools

- [Chart.js Chart Builder](https://www.chartjs.org/docs/latest/getting-started/) - Interactive chart builder
- [QR Code Generator](https://www.qr-code-generator.com/) - Online QR code testing
- [GraphViz Online](https://dreampuf.github.io/GraphvizOnline/) - Test DOT syntax online

## License

MIT
