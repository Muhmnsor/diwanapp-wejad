
import JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeFileName } from "../utils/textUtils";

/**
 * Download supporting files and add them to a specified folder
 */
export const downloadSupportingFiles = async (supportingFiles: any[], folder: JSZip) => {
  if (!supportingFiles || supportingFiles.length === 0) return;
  
  const filesToDownload = supportingFiles.map(async (file) => {
    try {
      // Extract the actual filename from the path
      const filePathParts = file.file_path.split('/');
      const actualFileName = filePathParts[filePathParts.length - 1];
      
      // Download the file from Supabase Storage
      const { data, error } = await supabase.storage
        .from('idea-files')
        .download(actualFileName);
        
      if (error) {
        console.error(`Error downloading file ${file.name}:`, error);
        return null;
      }
      
      if (!data) {
        console.error(`No data found for file ${file.name}`);
        return null;
      }
      
      // Add the file to the folder
      const safeFileName = sanitizeFileName(file.name);
      folder.file(safeFileName, data);
      
      return {
        name: safeFileName,
        success: true
      };
    } catch (error) {
      console.error(`Error downloading file ${file.name}:`, error);
      return {
        name: file.name,
        success: false,
        error: error.message
      };
    }
  });
  
  // Wait for all file downloads to complete
  const results = await Promise.all(filesToDownload);
  
  // Add a report of files that were downloaded successfully and those that failed
  const successfulFiles = results.filter(r => r && r.success).map(r => r.name);
  const failedFiles = results.filter(r => r && !r.success).map(r => `${r.name} (${r.error})`);
  
  const reportContent = `
تقرير تنزيل الملفات الداعمة:
===========================
عدد الملفات التي تم تنزيلها بنجاح: ${successfulFiles.length}
عدد الملفات التي فشل تنزيلها: ${failedFiles.length}

${failedFiles.length > 0 ? `الملفات التي فشل تنزيلها:\n${failedFiles.join('\n')}` : ''}
`;
  
  folder.file("_download_report.txt", reportContent);
};

/**
 * Download comment attachments and add them to a specified folder
 */
export const downloadCommentAttachments = async (comments: any[], folder: JSZip) => {
  if (!comments || comments.length === 0) return;
  
  const attachmentsToDownload = comments.map(async (comment) => {
    if (!comment.attachment_url) return null;
    
    try {
      // Determine the filename
      const fileName = comment.attachment_name || `attachment_${comment.id}`;
      const safeFileName = sanitizeFileName(fileName);
      
      // Download the file from URL
      const response = await fetch(comment.attachment_url);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Add the file to the folder
      folder.file(safeFileName, blob);
      
      return {
        name: safeFileName,
        success: true
      };
    } catch (error) {
      console.error(`Error downloading comment attachment:`, error);
      return {
        name: comment.attachment_name || `attachment_${comment.id}`,
        success: false,
        error: error.message
      };
    }
  });
  
  // Wait for all attachment downloads to complete
  const results = await Promise.all(attachmentsToDownload);
  
  // Add a report of attachments that were downloaded successfully and those that failed
  const successfulFiles = results.filter(r => r && r.success).map(r => r.name);
  const failedFiles = results.filter(r => r && !r.success).map(r => `${r.name} (${r.error})`);
  
  const reportContent = `
تقرير تنزيل مرفقات التعليقات:
===========================
عدد المرفقات التي تم تنزيلها بنجاح: ${successfulFiles.length}
عدد المرفقات التي فشل تنزيلها: ${failedFiles.length}

${failedFiles.length > 0 ? `المرفقات التي فشل تنزيلها:\n${failedFiles.join('\n')}` : ''}
`;
  
  folder.file("_download_report.txt", reportContent);
};
