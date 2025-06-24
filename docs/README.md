# QuickChart MCP Server

A Model Context Protocol (MCP) server that generates charts using QuickChart.io API. Create beautiful charts directly from your AI assistant with simple commands.

## Features

### Tools

#### `generate_chart`
Generate a chart URL using QuickChart.io
- **Input**: Chart type, labels, datasets, title, and additional options
- **Output**: URL to the generated chart image

#### `download_chart` 
Download a chart image from QuickChart.io
- **Input**: Chart configuration object and optional output path
- **Output**: Confirmation message with the saved file path

## Supported Chart Types

- **bar**: Bar charts for comparing values across categories
- **line**: Line charts for showing trends over time
- **pie**: Pie charts for showing proportions
- **doughnut**: Doughnut charts (pie chart with hollow center)
- **radar**: Radar charts for comparing multiple variables
- **polarArea**: Polar area charts for cyclical data
- **scatter**: Scatter plots for correlation analysis
- **bubble**: Bubble charts for three-dimensional data
- **radialGauge**: Radial gauges for showing single values
- **speedometer**: Speedometer-style gauges

## Installation

### Via npm

```bash
npm install -g @takanarishimbo/quickchart-mcp-server
```

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
        "QUICKCHART_BASE_URL": "https://your-quickchart-instance.com/chart"
      }
    }
  }
}
```

## Usage Examples

### Generate a Bar Chart

```json
{
  "type": "bar",
  "labels": ["January", "February", "March", "April"],
  "datasets": [
    {
      "label": "Sales 2024",
      "data": [65, 59, 80, 81],
      "backgroundColor": "rgba(75, 192, 192, 0.2)",
      "borderColor": "rgba(75, 192, 192, 1)"
    }
  ],
  "title": "Monthly Sales Report"
}
```

### Create a Line Chart with Multiple Datasets

```json
{
  "type": "line",
  "labels": ["Q1", "Q2", "Q3", "Q4"],
  "datasets": [
    {
      "label": "Product A",
      "data": [10, 25, 15, 30],
      "borderColor": "blue",
      "backgroundColor": "transparent"
    },
    {
      "label": "Product B", 
      "data": [20, 15, 25, 35],
      "borderColor": "red",
      "backgroundColor": "transparent"
    }
  ],
  "title": "Quarterly Product Comparison"
}
```

### Generate a Pie Chart

```json
{
  "type": "pie",
  "labels": ["Desktop", "Mobile", "Tablet"],
  "datasets": [
    {
      "data": [65, 25, 10],
      "backgroundColor": ["#FF6384", "#36A2EB", "#FFCE56"]
    }
  ],
  "title": "Device Usage Statistics"
}
```

### Create a Scatter Plot

```json
{
  "type": "scatter",
  "datasets": [
    {
      "label": "Dataset 1",
      "data": [
        {"x": 10, "y": 20},
        {"x": 15, "y": 25},
        {"x": 20, "y": 30}
      ],
      "backgroundColor": "rgba(255, 99, 132, 0.5)"
    }
  ],
  "title": "Scatter Plot Example"
}
```

### Generate a Radial Gauge

```json
{
  "type": "radialGauge",
  "datasets": [
    {
      "data": [75],
      "backgroundColor": "green"
    }
  ],
  "title": "Performance Score"
}
```

## Configuration

### Environment Variables

- **QUICKCHART_BASE_URL**: Base URL for QuickChart API (default: `https://quickchart.io/chart`)
  - Use this to point to a self-hosted QuickChart instance

## Development

### Method 1: Using Node.js locally

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

### Method 2: Using Docker (No Local Node.js Required)

1. **Clone the repository**

   ```bash
   git clone https://github.com/TakanariShimbo/quickchart-mcp-server.git
   cd quickchart-mcp-server
   ```

2. **Build and extract with one command**

   ```bash
   # Build the project inside Docker and output directly to local directory
   docker build -t quickchart-mcp-build .
   docker run --rm -v $(pwd):/app quickchart-mcp-build
   ```

## Project Structure

```
quickchart-mcp-server/
├── index.ts              # Main server implementation
├── package.json          # Package configuration
├── tsconfig.json         # TypeScript configuration
├── Dockerfile            # Docker configuration
├── .gitignore            # Git ignore file
├── .github/
│   └── workflows/
│       └── npm-publish.yml   # NPM publish workflow
├── scripts/
│   └── release.sh        # Release automation script
├── docs/
│   ├── README.md         # This file
│   └── README_ja.md      # Japanese documentation
└── dist/                 # Compiled JavaScript (after build)
```

## Resources

- [QuickChart Documentation](https://quickchart.io/documentation/)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## License

MIT