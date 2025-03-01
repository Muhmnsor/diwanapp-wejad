
import * as JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeFileName } from "../utils/textUtils";

/**
 * Download supporting files and add them to a specified folder
 */
export const downloadSupportingFiles = async (supportingFiles: any[], folder: JSZip) => {
  if (!supportingFiles || supportingFiles.length === 0) {
    console.log("لا توجد ملفات داعمة للتنزيل");
    return;
  }
  
  console.log(`محاولة تنزيل ${supportingFiles.length} ملف داعم`);
  
  const filesToDownload = supportingFiles.map(async (file) => {
    try {
      if (!file || !file.file_path) {
        console.error("معلومات الملف غير كاملة:", file);
        return {
          name: file?.name || "ملف غير معروف",
          success: false,
          error: "معلومات الملف غير كاملة"
        };
      }
      
      console.log(`Attempting to download file: ${file.name}, path: ${file.file_path}`);
      
      // استخراج اسم الملف الفعلي من المسار الكامل
      let actualFileName = file.file_path;
      
      // تجريب استخراج اسم الملف من المسار بطرق مختلفة
      if (file.file_path.includes('/')) {
        // إذا كان المسار يحتوي على '/'
        const filePathParts = file.file_path.split('/');
        actualFileName = filePathParts[filePathParts.length - 1];
      } else if (file.file_path.includes('\\')) {
        // إذا كان المسار يحتوي على '\'
        const filePathParts = file.file_path.split('\\');
        actualFileName = filePathParts[filePathParts.length - 1];
      }
      
      console.log(`استخلاص اسم الملف: ${actualFileName} من المسار: ${file.file_path}`);
      
      // التأكد من استخدام المسار الصحيح للملف في Supabase
      // محاولة تنزيل الملف من Supabase Storage
      const { data, error } = await supabase.storage
        .from('idea-files')
        .download(actualFileName);
        
      if (error) {
        console.error(`Error downloading file ${file.name}:`, error);
        
        // محاولة ثانية باستخدام المسار الكامل
        const secondAttempt = await supabase.storage
          .from('idea-files')
          .download(file.file_path);
          
        if (secondAttempt.error) {
          console.error(`Second attempt failed for file ${file.name}:`, secondAttempt.error);
          return {
            name: file.name,
            success: false,
            error: `Second attempt: ${secondAttempt.error.message}`
          };
        }
        
        if (!secondAttempt.data) {
          console.error(`No data returned on second attempt for file ${file.name}`);
          return {
            name: file.name,
            success: false,
            error: "No data returned on second attempt"
          };
        }
        
        console.log(`Successfully downloaded file on second attempt: ${file.name}`);
        
        // Add the file to the folder
        const safeFileName = sanitizeFileName(file.name);
        folder.file(safeFileName, secondAttempt.data);
        
        return {
          name: safeFileName,
          success: true
        };
      }
      
      if (!data) {
        console.error(`No data found for file ${file.name}`);
        return {
          name: file.name,
          success: false,
          error: "No data returned from storage"
        };
      }
      
      console.log(`Successfully downloaded file: ${file.name}, size: ${data.size} bytes`);
      
      // Add the file to the folder
      const safeFileName = sanitizeFileName(file.name);
      folder.file(safeFileName, data);
      
      return {
        name: safeFileName,
        success: true
      };
    } catch (error) {
      console.error(`Error downloading file ${file?.name || 'unknown'}:`, error);
      return {
        name: file?.name || 'unknown',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });
  
  // Wait for all file downloads to complete
  const results = await Promise.all(filesToDownload);
  
  // Add a report of files that were downloaded successfully and those that failed
  const successfulFiles = results.filter(r => r && r.success).map(r => r?.name);
  const failedFiles = results.filter(r => r && !r.success).map(r => `${r?.name} (${r?.error})`);
  
  const reportContent = `
تقرير تنزيل الملفات الداعمة:
===========================
عدد الملفات التي تم تنزيلها بنجاح: ${successfulFiles.length}
عدد الملفات التي فشل تنزيلها: ${failedFiles.length}

${failedFiles.length > 0 ? `الملفات التي فشل تنزيلها:\n${failedFiles.join('\n')}` : ''}
`;
  
  folder.file("_download_report.txt", reportContent);
  console.log(`تم إنشاء تقرير التنزيل. ${successfulFiles.length} ملفات ناجحة، ${failedFiles.length} ملفات فاشلة`);
};

/**
 * Download comment attachments and add them to a specified folder
 */
export const downloadCommentAttachments = async (comments: any[], folder: JSZip) => {
  if (!comments || comments.length === 0) {
    console.log("لا توجد مرفقات تعليقات للتنزيل");
    return;
  }
  
  console.log(`محاولة تنزيل مرفقات لـ ${comments.length} تعليق`);
  
  const attachmentsToDownload = comments.map(async (comment) => {
    if (!comment || !comment.attachment_url) {
      console.log("تعليق بدون مرفق", comment?.id);
      return null;
    }
    
    try {
      console.log(`Attempting to download comment attachment: ${comment.attachment_name || 'unnamed'}, URL: ${comment.attachment_url}`);
      
      // Determine the filename
      const fileName = comment.attachment_name || `attachment_${comment.id}`;
      const safeFileName = sanitizeFileName(fileName);
      
      // محاولة تنزيل الملف من URL
      const response = await fetch(comment.attachment_url);
      if (!response.ok) {
        console.error(`فشل تنزيل الملف: ${response.status} - ${response.statusText}`);
        throw new Error(`Failed to download file: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log(`Successfully downloaded comment attachment: ${safeFileName}, size: ${blob.size} bytes`);
      
      if (blob.size === 0) {
        console.warn(`تم تنزيل مرفق التعليق ولكن حجمه 0 بايت: ${safeFileName}`);
      }
      
      // Add the file to the folder
      folder.file(safeFileName, blob);
      
      return {
        name: safeFileName,
        success: true
      };
    } catch (error) {
      console.error(`Error downloading comment attachment for comment ${comment?.id}:`, error);
      return {
        name: comment?.attachment_name || `attachment_${comment?.id || 'unknown'}`,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });
  
  // Wait for all attachment downloads to complete
  const results = await Promise.all(attachmentsToDownload);
  
  // Add a report of attachments that were downloaded successfully and those that failed
  const validResults = results.filter(r => r !== null);
  const successfulFiles = validResults.filter(r => r && r.success).map(r => r?.name);
  const failedFiles = validResults.filter(r => r && !r.success).map(r => `${r?.name} (${r?.error})`);
  
  const reportContent = `
تقرير تنزيل مرفقات التعليقات:
===========================
عدد المرفقات التي تم تنزيلها بنجاح: ${successfulFiles.length}
عدد المرفقات التي فشل تنزيلها: ${failedFiles.length}

${failedFiles.length > 0 ? `المرفقات التي فشل تنزيلها:\n${failedFiles.join('\n')}` : ''}
`;
  
  folder.file("_download_report.txt", reportContent);
  console.log(`تم إنشاء تقرير التنزيل. ${successfulFiles.length} مرفقات ناجحة، ${failedFiles.length} مرفقات فاشلة`);
};
