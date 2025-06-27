[English](README.md) | [日本語](README_ja.md) | **README**

# QuickChart MCP Server

A comprehensive Model Context Protocol (MCP) server that provides 11 powerful visualization tools using QuickChart.io APIs. Create charts, diagrams, barcodes, QR codes, word clouds, tables, and more directly from your AI assistant with simple commands.

## Tools

### `create-chart-using-chartjs`

Create charts using Chart.js and QuickChart.io - get URL or save as file

**Documentation**: [QuickChart.io Chart API](https://quickchart.io/documentation/)

- **Input**: Action (get_url/save_file), outputPath, dimensions (integers), format options, encoding method, and Chart.js configuration object
- **Output**: Chart URL or confirmation message with saved file path

**Supported Chart Types:**
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

### `create-chart-using-apexcharts`

Create charts using ApexCharts library - get URL or save as file

**Documentation**: [ApexCharts Image Rendering](https://quickchart.io/documentation/apex-charts-image-rendering/)

- **Input**: Action (get_url/save_file), outputPath, ApexCharts configuration, dimensions, and version options
- **Output**: ApexCharts URL or confirmation message with saved file path

**Supported Features:**
- Line charts, area charts, datetime axis charts
- Customizable axis settings and data labels
- Line styles and stroke settings
- Tooltips and interactive elements
- Ideal for PDF reports and email embedding

### `create-chart-using-googlecharts`

Create charts using Google Charts library - get URL or save as file

**Documentation**: [Google Charts Image Server](https://quickchart.io/documentation/google-charts-image-server/)

- **Input**: Action (get_url/save_file), outputPath, JavaScript drawing code, packages, dimensions, and API keys
- **Output**: Google Charts URL or confirmation message with saved file path

**Supported Chart Types:**
- **Bar Charts**: Category data comparison
- **Pie Charts**: Percentage and proportion display
- **Gauge Charts**: Measurement and target value display
- **Timeline Charts**: Time-series event display
- **Geographic Charts**: World maps and regional maps (Maps API key support)

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

### `create-sparkline-using-chartjs`

Create compact sparkline charts - get URL or save as file

**Documentation**: [Sparkline API](https://quickchart.io/documentation/sparkline-api/)

- **Input**: Action (get_url/save_file), outputPath, Chart.js configuration, dimensions, and display options
- **Output**: Sparkline URL or confirmation message with saved file path

**Features:**
- **Compact Design**: Embeddable in text and dashboards
- **Trend Visualization**: Show data trends and variations at a glance
- **Single & Multiple Series**: Display one or multiple data lines
- **Customizable**: Adjustable colors, line styles, and point display
- **Smooth Lines**: Line tension adjustment for straight or curved display

### `create-diagram-using-graphviz`

Create graph diagrams using GraphViz - get URL or save as file

**Documentation**: [GraphViz API](https://quickchart.io/documentation/graphviz-api/)

- **Input**: Action (get_url/save_file), outputPath, DOT graph description, layout algorithm, format, and dimensions
- **Output**: GraphViz diagram URL or confirmation message with saved file path

**Supported Layout Algorithms:**
- **dot**: Hierarchical graphs (flowcharts)
- **neato**: Undirected graphs (network diagrams)
- **fdp**: Force-directed model layouts
- **circo**: Circular layouts
- **twopi**: Radial layouts

### `create-wordcloud`

Create word cloud visualizations - get URL or save as file

**Documentation**: [Word Cloud API](https://quickchart.io/documentation/word-cloud-api/)

- **Input**: Action (get_url/save_file), outputPath, text content, fonts, colors, and layout options
- **Output**: Word cloud URL or confirmation message with saved file path

**Customization Options:**
- **Text Processing**: Stopword removal, text cleaning, minimum word length settings
- **Font Settings**: Google Fonts loading, font family and weight adjustment
- **Size & Layout**: Maximum word count (default 200), rotation angle (default 20°)
- **Colors & Style**: Custom color palette, case conversion
- **Scaling**: Frequency scaling (linear, sqrt, log), font size adjustment

### `create-barcode`

Generate barcodes and QR codes - get URL or save as file

**Documentation**: [Barcode API](https://quickchart.io/documentation/barcode-api/)

- **Input**: Action (get_url/save_file), outputPath, barcode type, text data, dimensions, and formatting options
- **Output**: Barcode URL or confirmation message with saved file path

**Supported Barcode Types:**
- **QR Code**: High-density 2D barcode
- **Code 128**: Alphanumeric 1D barcode
- **EAN-13/UPC-A**: Standard product barcode
- **Data Matrix**: Small 2D barcode
- **PDF417**: High-capacity 2D barcode
- **Aztec**: Compact 2D barcode

### `create-table`

Convert data to table images - get URL or save as file

**Documentation**: [Table Image API](https://quickchart.io/documentation/apis/table-image-api/)

- **Input**: Action (get_url/save_file), outputPath, table data structure, column definitions, and styling options
- **Output**: Table image URL or confirmation message with saved file path

**Styling Features:**
- **Cell Settings**: Cell width and height (default 100x40px), left/right offset adjustment
- **Font Settings**: Font family (default "sans-serif")
- **Background Color**: Table background color (default "#ffffff")
- **Spacing**: Table spacing (20px), title spacing (10px)
- **Padding**: Vertical/horizontal padding, text alignment (right align, etc.)
- **Separator Lines**: Horizontal line insertion with "-" character support

### `create-qr-code`

Create QR codes with extensive customization options - get URL or save as file

**Documentation**: [QR Code API](https://quickchart.io/documentation/qr-codes/)

- **Input**: Action (get_url/save_file), outputPath, text content, format options, size, colors, error correction level, and advanced customization
- **Output**: QR code URL or confirmation message with saved file path

**Customization Features:**
- **Text Content**: URLs, plain text, contact info, WiFi credentials
- **Format Options**: PNG, SVG, Base64 output formats
- **Size & Colors**: Custom dimensions, foreground/background colors, transparent backgrounds
- **Error Correction**: L (Low), M (Medium), Q (Quartile), H (High) levels
- **Center Images**: Logo or image embedding with size ratio control
- **Captions**: Text below QR code with font customization
- **Advanced Styling**: Margin control, custom font families and colors

### `create-watermark`

Add watermarks and logos to images - get URL or save as file

**Documentation**: [Watermark API](https://quickchart.io/documentation/watermark-api/)

- **Input**: Action (get_url/save_file), outputPath, main image URL, watermark image URL, positioning, and opacity options
- **Output**: Watermarked image URL or confirmation message with saved file path

**Positioning Options:**
- **Preset Positions**: Center, corners, top/bottom middle, left/right middle
- **Custom Position**: Precise placement using X/Y coordinates
- **Margin Settings**: Distance adjustment from edges
- **Size Adjustment**: Ratio specification, absolute size specification
- **Opacity Control**: Range from 0.0 (transparent) to 1.0 (opaque)

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

### Using `create-chart-using-chartjs` Tool

The `create-chart-using-chartjs` tool can either return a chart URL or save a chart file, depending on the `action` parameter.

#### Get Chart URL (Default)

Set `action` to `"get_url"` (or omit it) to get a chart URL:

```json
{
  "action": "get_url",
  "chart": {
    "type": "bar",
    "data": {
      "labels": ["January", "February", "March", "April"],
      "datasets": [
        {
          "label": "Sales 2024",
          "data": [65, 59, 80, 81],
          "backgroundColor": "rgba(75, 192, 192, 0.2)",
          "borderColor": "rgba(75, 192, 192, 1)"
        }
      ]
    },
    "options": {
      "plugins": {
        "title": {
          "display": true,
          "text": "Monthly Sales Report"
        }
      }
    }
  }
}
```

#### Save Chart as File

Set `action` to `"save_file"` to save the chart locally:

```json
{
  "action": "save_file",
  "outputPath": "reports/device-usage.svg",
  "format": "svg",
  "chart": {
    "type": "pie",
    "data": {
      "labels": ["Desktop", "Mobile", "Tablet"],
      "datasets": [
        {
          "data": [65, 25, 10],
          "backgroundColor": ["#FF6384", "#36A2EB", "#FFCE56"]
        }
      ]
    },
    "options": {
      "plugins": {
        "title": {
          "display": true,
          "text": "Device Usage Statistics"
        }
      }
    }
  }
}
```

_Saves to: `Desktop/reports/device-usage.svg`_

#### More Chart Examples

**Line Chart with Multiple Datasets:**

```json
{
  "chart": {
    "type": "line",
    "data": {
      "labels": ["Q1", "Q2", "Q3", "Q4"],
      "datasets": [
        {
          "label": "Product A",
          "data": [10, 25, 15, 30],
          "borderColor": "blue"
        },
        {
          "label": "Product B",
          "data": [20, 15, 25, 35],
          "borderColor": "red"
        }
      ]
    },
    "options": {
      "plugins": {
        "title": {
          "display": true,
          "text": "Quarterly Product Comparison"
        }
      }
    }
  }
}
```

**Scatter Plot:**

```json
{
  "chart": {
    "type": "scatter",
    "data": {
      "datasets": [
        {
          "label": "Dataset 1",
          "data": [
            { "x": 10, "y": 20 },
            { "x": 15, "y": 25 },
            { "x": 20, "y": 30 }
          ],
          "backgroundColor": "rgba(255, 99, 132, 0.5)"
        }
      ]
    },
    "options": {
      "plugins": {
        "title": {
          "display": true,
          "text": "Scatter Plot Example"
        }
      }
    }
  }
}
```

**Radial Gauge:**

```json
{
  "chart": {
    "type": "radialGauge",
    "data": {
      "datasets": [
        {
          "data": [75],
          "backgroundColor": "green"
        }
      ]
    },
    "options": {
      "plugins": {
        "title": {
          "display": true,
          "text": "Performance Score"
        }
      }
    }
  }
}
```

#### File Save Options

**Supported Formats:**

- **PNG** (default): `"format": "png"`
- **WebP**: `"format": "webp"`
- **JPEG**: `"format": "jpg"`
- **SVG**: `"format": "svg"`
- **PDF**: `"format": "pdf"`
- **Base64**: `"format": "base64"`

**Save Locations:**

- **No path specified**: Desktop (or home directory if Desktop doesn't exist)
- **Relative path**: Relative to Desktop (or home directory)
- **Absolute path**: Exact path specified

## Advanced Configuration Examples

### Custom Dimensions and High DPI

```json
{
  "action": "save_file",
  "width": 1200,
  "height": 800,
  "devicePixelRatio": 2,
  "format": "png",
  "outputPath": "high-res-chart.png",
  "chart": {
    "type": "line",
    "data": {
      "labels": ["Jan", "Feb", "Mar"],
      "datasets": [
        {
          "data": [10, 20, 30],
          "borderColor": "blue"
        }
      ]
    }
  }
}
```

### PDF Output with Background Color

```json
{
  "action": "save_file",
  "format": "pdf",
  "backgroundColor": "#ffffff",
  "version": "3",
  "encoding": "url",
  "chart": {
    "type": "bar",
    "data": {
      "labels": ["Q1", "Q2", "Q3", "Q4"],
      "datasets": [
        {
          "data": [100, 150, 120, 180],
          "backgroundColor": "rgba(54, 162, 235, 0.8)"
        }
      ]
    }
  }
}
```

### Using Other Tools

#### Word Cloud Example

```json
{
  "action": "save_file",
  "outputPath": "wordcloud.png",
  "text": "artificial intelligence machine learning data science technology innovation",
  "width": 800,
  "height": 600,
  "backgroundColor": "#ffffff"
}
```

#### QR Code Generation Example

```json
{
  "action": "save_file",
  "outputPath": "qrcode.png",
  "text": "https://example.com",
  "size": 200,
  "dark": "000000",
  "light": "ffffff",
  "ecLevel": "M"
}
```

#### Barcode Generation Example

```json
{
  "action": "get_url",
  "type": "qr",
  "text": "https://example.com",
  "width": 200,
  "height": 200
}
```

#### Table Image Example

```json
{
  "action": "save_file",
  "outputPath": "sales-table.png",
  "data": {
    "title": "Q4 Sales Report",
    "columns": [
      { "title": "Product", "dataIndex": "product" },
      { "title": "Sales", "dataIndex": "sales" },
      { "title": "Growth", "dataIndex": "growth" }
    ],
    "dataSource": [
      { "product": "Product A", "sales": "$10,000", "growth": "+15%" },
      { "product": "Product B", "sales": "$8,500", "growth": "+8%" }
    ]
  }
}
```

#### GraphViz Diagram Example

```json
{
  "action": "get_url",
  "graph": "digraph G { A -> B; B -> C; A -> C; }",
  "layout": "dot",
  "format": "svg"
}
```

#### Text-to-Chart Example

```json
{
  "action": "save_file",
  "description": "Show monthly revenue growth as a blue line chart",
  "data1": "100,120,150,180,200",
  "labels": "Jan,Feb,Mar,Apr,May",
  "title": "Revenue Growth",
  "width": 600,
  "height": 400
}
```

## Configuration

### Environment Variables

You can customize API endpoints by setting these environment variables:

- **QUICKCHART_BASE_URL**: Chart.js charts API (default: `https://quickchart.io/chart`)
- **QUICKCHART_WORDCLOUD_URL**: Word cloud API (default: `https://quickchart.io/wordcloud`)
- **QUICKCHART_APEXCHARTS_URL**: ApexCharts API (default: `https://quickchart.io/apex-charts/render`)
- **QUICKCHART_BARCODE_URL**: Barcode API (default: `https://quickchart.io/barcode`)
- **QUICKCHART_GOOGLECHARTS_URL**: Google Charts API (default: `https://quickchart.io/google-charts/render`)
- **QUICKCHART_GRAPHVIZ_URL**: GraphViz API (default: `https://quickchart.io/graphviz`)
- **QUICKCHART_SPARKLINE_URL**: Sparkline API (default: `https://quickchart.io/chart`)
- **QUICKCHART_TABLE_URL**: Table API (default: `https://api.quickchart.io/v1/table`)
- **QUICKCHART_TEXTCHART_URL**: Text-to-Chart API (default: `https://quickchart.io/natural`)
- **QUICKCHART_WATERMARK_URL**: Watermark API (default: `https://quickchart.io/watermark`)
- **QUICKCHART_QRCODE_URL**: QR Code API (default: `https://quickchart.io/qr`)

Use these to point to self-hosted QuickChart instances or alternative endpoints.

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

- [QuickChart Documentation](https://quickchart.io/documentation/)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## License

MIT
