/**
 * Central configuration for QuickChart API endpoints
 */

// Default base URLs for different QuickChart instances
const DEFAULT_QUICKCHART_BASE = "https://quickchart.io";
const DEFAULT_API_QUICKCHART_BASE = "https://api.quickchart.io";

/**
 * Get the base URL for QuickChart API
 */
function getQuickChartBase(): string {
  return process.env.QUICKCHART_BASE_URL || DEFAULT_QUICKCHART_BASE;
}

/**
 * Get the base URL for API endpoints (used for table API)
 */
function getApiQuickChartBase(): string {
  return process.env.QUICKCHART_API_BASE_URL || DEFAULT_API_QUICKCHART_BASE;
}

/**
 * Get URL for a specific QuickChart endpoint
 */
export function getQuickChartUrl(endpoint: string): string {
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
  chart: () => getQuickChartUrl(QuickChartEndpoints.CHART),
  qrCode: () => getQuickChartUrl(QuickChartEndpoints.QR_CODE),
  sparkline: () => getQuickChartUrl(QuickChartEndpoints.SPARKLINE),
  apexCharts: () => getQuickChartUrl(QuickChartEndpoints.APEX_CHARTS),
  googleCharts: () => getQuickChartUrl(QuickChartEndpoints.GOOGLE_CHARTS),
  barcode: () => getQuickChartUrl(QuickChartEndpoints.BARCODE),
  table: () => getQuickChartUrl(QuickChartEndpoints.TABLE),
  wordcloud: () => getQuickChartUrl(QuickChartEndpoints.WORDCLOUD),
  graphviz: () => getQuickChartUrl(QuickChartEndpoints.GRAPHVIZ),
  textChart: () => getQuickChartUrl(QuickChartEndpoints.TEXT_CHART),
  watermark: () => getQuickChartUrl(QuickChartEndpoints.WATERMARK),
} as const;
