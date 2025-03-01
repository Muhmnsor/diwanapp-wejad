
import { saveAs } from "file-saver";
import { 
  generateIdeaTextContent,
  generateCommentsTextContent,
  generateVotesTextContent,
  generateDecisionTextContent,
  sanitizeFileName 
} from "../utils/textUtils";

/**
 * Export idea data as a text file
 */
export const exportToText = (data: any, ideaTitle: string) => {
  let content = "";
  
  // إضافة بيانات الفكرة الأساسية
  content += generateIdeaTextContent(data.idea);
  
  // إضافة التعليقات إذا وجدت
  if (data.comments) {
    content += "\n\n" + "=" .repeat(50) + "\n";
    content += generateCommentsTextContent(data.comments);
  }
  
  // إضافة التصويتات إذا وجدت
  if (data.votes) {
    content += "\n\n" + "=" .repeat(50) + "\n";
    content += generateVotesTextContent(data.votes);
  }
  
  // إضافة القرار إذا وجد
  if (data.decision) {
    content += "\n\n" + "=" .repeat(50) + "\n";
    content += generateDecisionTextContent(data.decision);
  }
  
  // Create and download the text file
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const fileName = sanitizeFileName(`فكرة-${ideaTitle}.txt`);
  saveAs(blob, fileName);
};
