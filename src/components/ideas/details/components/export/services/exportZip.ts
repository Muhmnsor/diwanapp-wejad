
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { 
  generateIdeaTextContent, 
  generateCommentsTextContent, 
  generateVotesTextContent, 
  generateDecisionTextContent,
  sanitizeFileName 
} from "../utils/textUtils";
import { 
  downloadSupportingFiles, 
  downloadCommentAttachments 
} from "./downloadFiles";

/**
 * Export idea data as a ZIP file
 */
export const exportToZip = async (data: any, ideaTitle: string, exportOptions: string[]) => {
  console.log("Starting ZIP export process with data:", data);
  const zip = new JSZip();
  
  try {
    // Add a file for the idea
    zip.file("idea.txt", generateIdeaTextContent(data.idea));
    
    // Add a file for comments if available
    if (data.comments && data.comments.length > 0) {
      console.log(`Adding ${data.comments.length} comments to ZIP`);
      zip.file("comments.txt", generateCommentsTextContent(data.comments));
    }
    
    // Add a file for votes if available
    if (data.votes && data.votes.length > 0) {
      console.log(`Adding ${data.votes.length} votes to ZIP`);
      zip.file("votes.txt", generateVotesTextContent(data.votes));
    }
    
    // Add a file for the decision if available
    if (data.decision) {
      console.log("Adding decision data to ZIP");
      zip.file("decision.txt", generateDecisionTextContent(data.decision));
    }
    
    // Add a folder for attachment information
    const attachmentsFolder = zip.folder("attachments_info");
    
    // Add supporting files information
    if (data.idea.supporting_files && Array.isArray(data.idea.supporting_files) && data.idea.supporting_files.length > 0) {
      console.log(`Processing ${data.idea.supporting_files.length} supporting files`);
      const supportingFilesInfoText = "الملفات الداعمة للفكرة (روابط فقط):\n\n" + 
        data.idea.supporting_files.map((file: any, index: number) => 
          `${index + 1}. ${file.name}: ${file.file_path}`
        ).join("\n");
      
      attachmentsFolder.file("supporting_files_info.txt", supportingFilesInfoText);
      
      // If download_files option is selected
      if (exportOptions.includes("download_files")) {
        const filesFolder = zip.folder("files");
        
        // Download supporting files
        await downloadSupportingFiles(data.idea.supporting_files, filesFolder);
      }
    }
    
    // Add comment attachments information
    if (data.comments) {
      const commentsWithAttachments = data.comments.filter((comment: any) => comment.attachment_url);
      if (commentsWithAttachments.length > 0) {
        console.log(`Processing ${commentsWithAttachments.length} comment attachments`);
        const commentAttachmentsInfoText = "مرفقات التعليقات (روابط فقط):\n\n" + 
          commentsWithAttachments.map((comment: any, index: number) => 
            `${index + 1}. ${comment.attachment_name || 'ملف مرفق'}: ${comment.attachment_url}`
          ).join("\n");
        
        attachmentsFolder.file("comment_attachments_info.txt", commentAttachmentsInfoText);
        
        // If download_files option is selected
        if (exportOptions.includes("download_files")) {
          const commentsFolder = zip.folder("comment_attachments");
          
          // Download comment attachments
          await downloadCommentAttachments(commentsWithAttachments, commentsFolder);
        }
      }
    }
    
    // Create and download the ZIP file
    console.log("Generating ZIP file...");
    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 5
      }
    });
    
    const fileName = sanitizeFileName(`فكرة-${ideaTitle}.zip`);
    console.log(`Saving ZIP file as: ${fileName}`);
    saveAs(zipBlob, fileName);
    console.log("ZIP file saved successfully");
  } catch (error) {
    console.error("Error creating ZIP file:", error);
    throw new Error(`Failed to create ZIP file: ${error.message}`);
  }
};
