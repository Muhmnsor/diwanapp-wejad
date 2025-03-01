
import { saveAs } from "file-saver";
import { 
  generateTextContent,
  sanitizeFileName 
} from "../utils/textUtils";

/**
 * Export idea data as a text file
 */
export const exportToText = (data: any, ideaTitle: string) => {
  let content = generateTextContent(data);
  
  // Create and download the text file
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const fileName = sanitizeFileName(`فكرة-${ideaTitle}.txt`);
  saveAs(blob, fileName);
};
