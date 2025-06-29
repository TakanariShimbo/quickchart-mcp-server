import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { getDownloadPath } from "../utils/file.js";
import { QuickChartUrls } from "../utils/config.js";

export const CREATE_WORDCLOUD_TOOL: Tool = {
  name: "create-wordcloud",
  description:
    "Create a word cloud using QuickChart.io - get word cloud image URL or save word cloud image to file",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["get_url", "save_file"],
        description: "Whether to get word cloud URL or save as file",
      },
      outputPath: {
        type: "string",
        description:
          "Path where to save the file (only used with action=save_file)",
      },
      text: {
        type: "string",
        description: "Input text for word cloud generation",
      },
      format: {
        type: "string",
        enum: ["svg", "png"],
        description: "Output format (default: svg)",
      },
      width: {
        type: "integer",
        description: "Image width in pixels",
      },
      height: {
        type: "integer",
        description: "Image height in pixels",
      },
      backgroundColor: {
        type: "string",
        description: "Background color - rgb, hex, hsl, or color names",
      },
      fontFamily: {
        type: "string",
        description: "Font family to use for words",
      },
      fontWeight: {
        type: "string",
        description: "Font weight (normal, bold, etc.)",
      },
      loadGoogleFonts: {
        type: "string",
        description: "Google Fonts to load (comma-separated)",
      },
      fontScale: {
        type: "number",
        description: "Largest font size for most frequent words",
      },
      scale: {
        type: "string",
        description: "Frequency scaling method",
      },
      padding: {
        type: "number",
        description: "Pixel spacing between words",
      },
      rotation: {
        type: "number",
        description: "Maximum word rotation angle in degrees",
      },
      maxNumWords: {
        type: "integer",
        description: "Maximum number of words to display",
      },
      minWordLength: {
        type: "integer",
        description: "Minimum word character length",
      },
      case: {
        type: "string",
        enum: ["upper", "lower", "none"],
        description: "Word case transformation",
      },
      colors: {
        type: "array",
        items: { type: "string" },
        description: "Array of color values for words",
      },
      removeStopwords: {
        type: "boolean",
        description: "Remove common stopwords",
      },
      cleanWords: {
        type: "boolean",
        description: "Remove symbols and extra characters from words",
      },
      language: {
        type: "string",
        description: "Language code for stopword removal (e.g., 'en', 'es')",
      },
      useWordList: {
        type: "boolean",
        description:
          "Treat input text as a list of words rather than sentences",
      },
    },
    required: ["action", "text"],
  },
};

export function validateWordCloudText(text: string): void {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Text is required and must be a non-empty string"
    );
  }
}

export function buildWordCloudConfig(
  text: string,
  options: {
    format?: string;
    width?: number;
    height?: number;
    backgroundColor?: string;
    fontFamily?: string;
    fontWeight?: string;
    loadGoogleFonts?: string;
    fontScale?: number;
    scale?: string;
    padding?: number;
    rotation?: number;
    maxNumWords?: number;
    minWordLength?: number;
    case?: string;
    colors?: string[];
    removeStopwords?: boolean;
    cleanWords?: boolean;
    language?: string;
    useWordList?: boolean;
  } = {}
): any {
  const config: any = {
    text,
    format: options.format || "svg",
  };

  if (options.width !== undefined) config.width = options.width;
  if (options.height !== undefined) config.height = options.height;
  if (options.backgroundColor) config.backgroundColor = options.backgroundColor;
  if (options.fontFamily) config.fontFamily = options.fontFamily;
  if (options.fontWeight) config.fontWeight = options.fontWeight;
  if (options.loadGoogleFonts) config.loadGoogleFonts = options.loadGoogleFonts;
  if (options.fontScale !== undefined) config.fontScale = options.fontScale;
  if (options.scale) config.scale = options.scale;
  if (options.padding !== undefined) config.padding = options.padding;
  if (options.rotation !== undefined) config.rotation = options.rotation;
  if (options.maxNumWords !== undefined)
    config.maxNumWords = options.maxNumWords;
  if (options.minWordLength !== undefined)
    config.minWordLength = options.minWordLength;
  if (options.case) config.case = options.case;
  if (options.colors && options.colors.length > 0)
    config.colors = options.colors;
  if (options.removeStopwords !== undefined)
    config.removeStopwords = options.removeStopwords;
  if (options.cleanWords !== undefined) config.cleanWords = options.cleanWords;
  if (options.language) config.language = options.language;
  if (options.useWordList !== undefined)
    config.useWordList = options.useWordList;

  return config;
}

function prepareWordCloudConfig(text: string, args: any): any {
  return buildWordCloudConfig(text, {
    format: args.format as string,
    width: args.width as number,
    height: args.height as number,
    backgroundColor: args.backgroundColor as string,
    fontFamily: args.fontFamily as string,
    fontWeight: args.fontWeight as string,
    loadGoogleFonts: args.loadGoogleFonts as string,
    fontScale: args.fontScale as number,
    scale: args.scale as string,
    padding: args.padding as number,
    rotation: args.rotation as number,
    maxNumWords: args.maxNumWords as number,
    minWordLength: args.minWordLength as number,
    case: args.case as string,
    colors: args.colors as string[],
    removeStopwords: args.removeStopwords as boolean,
    cleanWords: args.cleanWords as boolean,
    language: args.language as string,
    useWordList: args.useWordList as boolean,
  });
}

async function fetchWordCloudContent(
  postConfig: any,
  format: string = "png"
): Promise<any> {
  try {
    const responseType = format === "svg" ? "text" : "arraybuffer";
    const response = await axios.post(QuickChartUrls.wordcloud(), postConfig, {
      responseType: responseType as any,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to fetch word cloud content: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

function generateWordCloudUrls(postConfig: any): {
  chartUrl: string;
} {
  const text = postConfig.text;
  const encodedText = encodeURIComponent(text);

  return {
    chartUrl: `https://quickchart.io/wordcloud?text=${encodedText}`,
  };
}

export async function handleWordCloudTool(args: any): Promise<any> {
  validateWordCloudText(args.text as string);

  const action = args.action as string;
  if (action !== "get_url" && action !== "save_file") {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid action: ${action}. Use 'get_url' or 'save_file'`
    );
  }

  const postConfig = prepareWordCloudConfig(args.text as string, args);
  const { chartUrl } = generateWordCloudUrls(postConfig);
  const pngData = await fetchWordCloudContent(postConfig, "png");
  const pngBase64 = Buffer.from(pngData).toString("base64");

  const result: any = {
    content: [
      {
        type: "text",
        text: "Below is the wordcloud URL:",
      },
      {
        type: "text",
        text: chartUrl,
      },
      {
        type: "text",
        text: "Below is the PNG image:",
      },
      {
        type: "image",
        data: pngBase64,
        mimeType: "image/png",
      },
    ],
    metadata: {
      chartType: "wordcloud",
      generatedAt: new Date().toISOString(),
      chartUrl: chartUrl,
      pngBase64: pngBase64,
    },
  };

  if (action === "get_url") {
    return result;
  }

  const format = (args.format as string) || "png";
  const outputPath = getDownloadPath(
    args.outputPath as string | undefined,
    format
  );

  try {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const data = await fetchWordCloudContent(postConfig, format);
    if (format === "svg") {
      fs.writeFileSync(outputPath, data, "utf8");
    } else {
      fs.writeFileSync(outputPath, data);
    }

    result.metadata.savedPath = outputPath;
    result.content.push({
      type: "text",
      text: "Below is the saved file path:",
    });
    result.content.push({
      type: "text",
      text: outputPath,
    });
    return result;
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to save wordcloud: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
