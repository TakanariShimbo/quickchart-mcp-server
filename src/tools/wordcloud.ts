import { Tool, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { getDownloadPath } from "../utils/file.js";

// Configuration
const QUICKCHART_WORDCLOUD_URL = process.env.QUICKCHART_WORDCLOUD_URL || "https://quickchart.io/wordcloud";

export const CREATE_WORDCLOUD_TOOL: Tool = {
  name: "create-wordcloud",
  description: "Create a word cloud using QuickChart.io - get URL or save as file",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["get_url", "save_file"],
        description: "Whether to get word cloud URL or save as file (default: get_url)",
      },
      outputPath: {
        type: "string",
        description: "Path where to save the file (only used with action=save_file)",
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
        description: "Treat input text as a list of words rather than sentences",
      },
    },
    required: ["text"],
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

  // Add optional parameters only if they are provided
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
  if (options.maxNumWords !== undefined) config.maxNumWords = options.maxNumWords;
  if (options.minWordLength !== undefined) config.minWordLength = options.minWordLength;
  if (options.case) config.case = options.case;
  if (options.colors && options.colors.length > 0) config.colors = options.colors;
  if (options.removeStopwords !== undefined) config.removeStopwords = options.removeStopwords;
  if (options.cleanWords !== undefined) config.cleanWords = options.cleanWords;
  if (options.language) config.language = options.language;
  if (options.useWordList !== undefined) config.useWordList = options.useWordList;

  return config;
}

export async function handleWordCloudTool(args: any): Promise<any> {
  validateWordCloudText(args.text as string);
  
  const action = (args.action as string) || "get_url";
  
  const wordCloudConfig = buildWordCloudConfig(args.text as string, {
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

  if (action === "get_url") {
    return {
      content: [
        {
          type: "text",
          text: `POST to ${QUICKCHART_WORDCLOUD_URL}\nContent-Type: application/json\n\n${JSON.stringify(wordCloudConfig, null, 2)}`,
        },
      ],
    };
  }

  if (action === "save_file") {
    const format = (args.format as string) || "svg";
    const outputPath = getDownloadPath(args.outputPath as string | undefined, format);

    try {
      const responseType = format === "svg" ? "text" : "arraybuffer";
      const response = await axios.post(QUICKCHART_WORDCLOUD_URL, wordCloudConfig, {
        responseType: responseType as any,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (format === "svg") {
        fs.writeFileSync(outputPath, response.data, "utf8");
      } else {
        fs.writeFileSync(outputPath, response.data);
      }

      return {
        content: [
          {
            type: "text",
            text: `Word cloud saved successfully to: ${outputPath}`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to save word cloud: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  throw new McpError(
    ErrorCode.InvalidParams,
    `Invalid action: ${action}. Use 'get_url' or 'save_file'`
  );
}