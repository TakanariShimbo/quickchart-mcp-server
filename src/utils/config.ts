/**
 * Central configuration for QuickChart API endpoints
 */

// Default base URLs for different QuickChart instances
const DEFAULT_QUICKCHART_BASE = "https://quickchart.io";
const DEFAULT_API_QUICKCHART_BASE = "https://api.quickchart.io";

/**
 * Get the base URL for QuickChart API
 * Supports both QUICKCHART_BASE_URL and QUICKCHART_HOST for backward compatibility
 */
function getQuickChartBase(): string {
  return (
    process.env.QUICKCHART_BASE_URL ||
    process.env.QUICKCHART_HOST ||
    DEFAULT_QUICKCHART_BASE
  );
}

/**
 * Get the base URL for API endpoints (used for table API)
 */
function getApiQuickChartBase(): string {
  // If user sets a custom base, use it for API endpoints too
  const customBase =
    process.env.QUICKCHART_BASE_URL || process.env.QUICKCHART_HOST;
  if (customBase) {
    return customBase;
  }
  return DEFAULT_API_QUICKCHART_BASE;
}

/**
 * Get URL for a specific QuickChart endpoint
 * Falls back to specific environment variables for backward compatibility
 */
export function getQuickChartUrl(
  endpoint: string,
  specificEnvVar?: string
): string {
  // Check for specific environment variable first (backward compatibility)
  if (specificEnvVar && process.env[specificEnvVar]) {
    return process.env[specificEnvVar]!;
  }

  // Use central configuration
  const baseUrl =
    endpoint === "/v1/table" ? getApiQuickChartBase() : getQuickChartBase();
  return `${baseUrl}${endpoint}`;
}

/**
 * Predefined endpoint configurations
 */
export const QuickChartEndpoints = {
  CHART: "/chart",
  QR_CODE: "/qr",
  SPARKLINE: "/chart",
  APEX_CHARTS: "/apex-charts/render",
  GOOGLE_CHARTS: "/google-charts/render",
  BARCODE: "/barcode",
  TABLE: "/v1/table",
  WORDCLOUD: "/wordcloud",
  GRAPHVIZ: "/graphviz",
  TEXT_CHART: "/natural",
  WATERMARK: "/watermark",
} as const;

/**
 * Get URLs for all QuickChart services
 */
export const QuickChartUrls = {
  chart: () =>
    getQuickChartUrl(QuickChartEndpoints.CHART, "QUICKCHART_BASE_URL"),
  qrCode: () =>
    getQuickChartUrl(QuickChartEndpoints.QR_CODE, "QUICKCHART_QRCODE_URL"),
  sparkline: () =>
    getQuickChartUrl(QuickChartEndpoints.SPARKLINE, "QUICKCHART_SPARKLINE_URL"),
  apexCharts: () =>
    getQuickChartUrl(
      QuickChartEndpoints.APEX_CHARTS,
      "QUICKCHART_APEXCHARTS_URL"
    ),
  googleCharts: () =>
    getQuickChartUrl(
      QuickChartEndpoints.GOOGLE_CHARTS,
      "QUICKCHART_GOOGLECHARTS_URL"
    ),
  barcode: () =>
    getQuickChartUrl(QuickChartEndpoints.BARCODE, "QUICKCHART_BARCODE_URL"),
  table: () =>
    getQuickChartUrl(QuickChartEndpoints.TABLE, "QUICKCHART_TABLE_URL"),
  wordcloud: () =>
    getQuickChartUrl(QuickChartEndpoints.WORDCLOUD, "QUICKCHART_WORDCLOUD_URL"),
  graphviz: () =>
    getQuickChartUrl(QuickChartEndpoints.GRAPHVIZ, "QUICKCHART_GRAPHVIZ_URL"),
  textChart: () =>
    getQuickChartUrl(
      QuickChartEndpoints.TEXT_CHART,
      "QUICKCHART_TEXTCHART_URL"
    ),
  watermark: () =>
    getQuickChartUrl(QuickChartEndpoints.WATERMARK, "QUICKCHART_WATERMARK_URL"),
} as const;
