import * as fs from "fs";
import * as path from "path";

/**
 * Get appropriate download path for files
 */
export function getDownloadPath(outputPath?: string, format: string = "png"): string {
  // Get the default directory from environment variable
  const defaultDirConfig = process.env.QUICKCHART_DEFAULT_OUTPUT_DIR;
  const desktopPath = path.join(
    process.env.HOME || process.env.USERPROFILE || ".",
    "Desktop"
  );
  let basePath: string;
  
  if (defaultDirConfig && path.isAbsolute(defaultDirConfig) && fs.existsSync(defaultDirConfig)) {
    // Use absolute path only if it exists
    basePath = defaultDirConfig;
  } else {
    // Fallback to Desktop in home directory for any invalid case
    basePath = desktopPath;
  }
  
  if (outputPath) {
    if (path.isAbsolute(outputPath)) {
      return outputPath;
    }
    
    if (fs.existsSync(basePath)) {
      return path.join(basePath, outputPath);
    }
    
    // Fallback to Desktop if configured path doesn't exist
    if (fs.existsSync(desktopPath)) {
      return path.join(desktopPath, outputPath);
    }
    
    // Final fallback to home directory
    return path.join(
      process.env.HOME || process.env.USERPROFILE || ".",
      outputPath
    );
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T]/g, "")
    .split(".")[0];
  const filename = `chart_${timestamp}.${format}`;

  if (fs.existsSync(basePath)) {
    return path.join(basePath, filename);
  }

  // Fallback to Desktop if configured path doesn't exist
  if (fs.existsSync(desktopPath)) {
    return path.join(desktopPath, filename);
  }

  // Final fallback to home directory
  return path.join(
    process.env.HOME || process.env.USERPROFILE || ".",
    filename
  );
}