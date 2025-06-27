[English](README.md) | [日本語](README_ja.md) | **README**

# QuickChart MCP Server

A Model Context Protocol (MCP) server that generates charts using QuickChart.io API. Create beautiful charts directly from your AI assistant with simple commands.

## Features

### Tools

#### `create-chart-using-chartjs`

Create a chart using QuickChart.io - get URL or save as file

- **Input**: Action (get_url/save_file), outputPath, dimensions (integers), format options, encoding method, and Chart.js configuration object
- **Output**: Chart URL or confirmation message with saved file path

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
*Saves to: `Desktop/reports/device-usage.svg`*

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
      "datasets": [{
        "data": [10, 20, 30],
        "borderColor": "blue"
      }]
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
      "datasets": [{
        "data": [100, 150, 120, 180],
        "backgroundColor": "rgba(54, 162, 235, 0.8)"
      }]
    }
  }
}
```

## Configuration

### Environment Variables

- **QUICKCHART_BASE_URL**: Base URL for QuickChart API (default: `https://quickchart.io/chart`)
  - Use this to point to a self-hosted QuickChart instance

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
│   └── index.ts          # Main server implementation
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
