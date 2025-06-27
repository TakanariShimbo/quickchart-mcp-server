import * as fs from "fs";
import * as path from "path";

/**
 * Get appropriate download path for files
 */
export function getDownloadPath(outputPath?: string, format: string = "png"): string {
  if (outputPath) {
    if (path.isAbsolute(outputPath)) {
      return outputPath;
    }
    const desktopPath = path.join(
      process.env.HOME || process.env.USERPROFILE || ".",
      "Desktop"
    );
    if (fs.existsSync(desktopPath)) {
      return path.join(desktopPath, outputPath);
    }
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
  const desktopPath = path.join(
    process.env.HOME || process.env.USERPROFILE || ".",
    "Desktop"
  );

  if (fs.existsSync(desktopPath)) {
    return path.join(desktopPath, filename);
  }

  return path.join(
    process.env.HOME || process.env.USERPROFILE || ".",
    filename
  );
}