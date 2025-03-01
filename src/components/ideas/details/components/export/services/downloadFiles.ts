
import * as JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeFileName } from "../utils/textUtils";

// Define types for the file download result
interface FileDownloadResult {
  name: string;
  success: boolean;
  error?: string;
  method?: string;
  size?: number;
}

/**
 * Download supporting files and add them to a specified folder
 */
export const downloadSupportingFiles = async (supportingFiles: any[], folder: JSZip) => {
  if (!supportingFiles || supportingFiles.length === 0) {
    console.log("لا توجد ملفات داعمة للتنزيل");
    return;
  }
  
  console.log(`محاولة تنزيل ${supportingFiles.length} ملف داعم`, {
    folderType: typeof folder,
    folderIsValid: !!folder,
    supabaseAvailable: !!supabase
  });
  
  console.log("تفاصيل المكتبة JSZip:", {
    version: JSZip.version || "غير معروف",
    methods: Object.keys(JSZip.prototype || {}),
    folderMethods: typeof folder.file === "function" ? "folder.file() متاح" : "folder.file() غير متاح"
  });
  
  try {
    // تحقق من صلاحية كائن JSZip
    if (!folder || typeof folder.file !== "function") {
      console.error("كائن JSZip غير صالح:", folder);
      throw new Error("كائن JSZip غير صالح أو تم تعريفه بشكل غير صحيح");
    }
    
    // تحقق من اتصال Supabase
    if (!supabase || !supabase.storage) {
      console.error("كائن Supabase غير متاح أو لا يحتوي على خاصية storage");
      throw new Error("API Supabase غير متاح");
    }
    
    const filesToDownload = supportingFiles.map(async (file, index) => {
      try {
        if (!file || !file.file_path) {
          console.error(`معلومات الملف #${index + 1} غير كاملة:`, file);
          return {
            name: file?.name || "ملف غير معروف",
            success: false,
            error: "معلومات الملف غير كاملة"
          } as FileDownloadResult;
        }
        
        console.log(`(${index + 1}/${supportingFiles.length}) محاولة تنزيل الملف: ${file.name}, المسار: ${file.file_path}`);
        
        // استخراج اسم الملف الفعلي من المسار الكامل
        let filePathForDownload = file.file_path;
        
        // تجريب تنزيل الملف باستخدام URL مباشر كطريقة أولى
        try {
          console.log(`محاولة تنزيل الملف عبر URL: ${filePathForDownload}`);
          
          // الحصول على URL التنزيل المؤقت
          const { data: urlData, error: urlError } = await supabase.storage
            .from('idea-files')
            .createSignedUrl(filePathForDownload, 60);
          
          if (urlError || !urlData || !urlData.signedUrl) {
            console.error(`فشل الحصول على URL للملف ${file.name}:`, urlError || "لا يوجد URL");
            throw new Error(`فشل الحصول على URL: ${urlError?.message || "URL غير متاح"}`);
          }
          
          console.log(`تم الحصول على URL للملف: ${urlData.signedUrl.substring(0, 50)}...`);
          
          // تنزيل الملف باستخدام fetch من URL المُوقّع
          const fetchResponse = await fetch(urlData.signedUrl);
          
          if (!fetchResponse.ok) {
            console.error(`استجابة HTTP غير ناجحة: ${fetchResponse.status} - ${fetchResponse.statusText}`);
            throw new Error(`HTTP error! status: ${fetchResponse.status}`);
          }
          
          const fetchedData = await fetchResponse.blob();
          
          if (!fetchedData || fetchedData.size === 0) {
            console.error("تم تنزيل ملف فارغ");
            throw new Error("تم تنزيل ملف فارغ");
          }
          
          console.log(`تم تنزيل الملف ${file.name} بنجاح عبر fetch من URL، الحجم: ${fetchedData.size} بايت`);
          
          // إضافة الملف إلى المجلد
          const safeFileName = sanitizeFileName(file.name);
          folder.file(safeFileName, fetchedData);
          
          return {
            name: safeFileName,
            success: true,
            method: "fetch-url",
            size: fetchedData.size
          } as FileDownloadResult;
        } catch (fetchUrlError) {
          console.error(`خطأ في تنزيل الملف ${file.name} عبر URL:`, fetchUrlError);
          console.log("المحاولة الثانية: تنزيل مباشر من التخزين");
          
          // اذا فشل التنزيل عبر URL، محاولة التنزيل المباشر
          // استخراج اسم الملف الفعلي من المسار الكامل للمحاولة الثانية
          let actualFileName = file.file_path;
          
          if (file.file_path.includes('/')) {
            // إذا كان المسار يحتوي على '/'
            const filePathParts = file.file_path.split('/');
            actualFileName = filePathParts[filePathParts.length - 1];
          } else if (file.file_path.includes('\\')) {
            // إذا كان المسار يحتوي على '\'
            const filePathParts = file.file_path.split('\\');
            actualFileName = filePathParts[filePathParts.length - 1];
          }
          
          console.log(`استخلاص اسم الملف: "${actualFileName}" من المسار: "${file.file_path}"`);
          
          const { data, error } = await supabase.storage
            .from('idea-files')
            .download(actualFileName);
            
          if (error) {
            console.error(`خطأ في تنزيل الملف ${file.name} بالمسار ${actualFileName}:`, error);
            
            // محاولة ثالثة باستخدام المسار الأصلي الكامل
            console.log(`محاولة ثالثة باستخدام المسار الكامل: ${file.file_path}`);
            
            const thirdAttempt = await supabase.storage
              .from('idea-files')
              .download(file.file_path);
              
            if (thirdAttempt.error) {
              console.error(`فشل المحاولة الثالثة لتنزيل الملف ${file.name}:`, thirdAttempt.error);
              return {
                name: file.name,
                success: false,
                error: `فشلت جميع المحاولات: ${thirdAttempt.error.message}`
              } as FileDownloadResult;
            }
            
            if (!thirdAttempt.data) {
              console.error(`لا توجد بيانات في المحاولة الثالثة للملف ${file.name}`);
              return {
                name: file.name,
                success: false,
                error: "لم يتم إرجاع بيانات في المحاولة الثالثة"
              } as FileDownloadResult;
            }
            
            console.log(`تم تنزيل الملف بنجاح في المحاولة الثالثة: ${file.name}، الحجم: ${thirdAttempt.data.size} بايت`);
            
            // إضافة الملف إلى المجلد
            const safeFileName = sanitizeFileName(file.name);
            folder.file(safeFileName, thirdAttempt.data);
            
            return {
              name: safeFileName,
              success: true,
              method: "direct-download-full-path",
              size: thirdAttempt.data.size
            } as FileDownloadResult;
          }
          
          if (!data) {
            console.error(`لا توجد بيانات للملف ${file.name}`);
            return {
              name: file.name,
              success: false,
              error: "لم يتم إرجاع بيانات من التخزين"
            } as FileDownloadResult;
          }
          
          console.log(`تم تنزيل الملف بنجاح: ${file.name}، الحجم: ${data.size} بايت، النوع: ${data.type}`);
          
          // إضافة الملف إلى المجلد
          const safeFileName = sanitizeFileName(file.name);
          folder.file(safeFileName, data);
          
          return {
            name: safeFileName,
            success: true,
            method: "direct-download-filename",
            size: data.size
          } as FileDownloadResult;
        }
      } catch (error) {
        console.error(`خطأ في تنزيل الملف ${file?.name || 'unknown'}:`, error);
        console.error("تفاصيل الخطأ:", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : "No stack trace available"
        });
        
        return {
          name: file?.name || 'unknown',
          success: false,
          error: error instanceof Error ? error.message : String(error)
        } as FileDownloadResult;
      }
    });
    
    console.log(`جاري تنزيل ${filesToDownload.length} ملف...`);
    
    // انتظار جميع عمليات التنزيل
    const results = await Promise.all(filesToDownload);
    
    // إضافة تقرير عن الملفات التي تم تنزيلها بنجاح وتلك التي فشل تنزيلها
    const successfulFiles = results.filter((r): r is FileDownloadResult => r && r.success).map(r => r.name);
    const failedFiles = results.filter((r): r is FileDownloadResult => r && !r.success).map(r => `${r.name} (${r.error})`);
    
    console.log(`اكتمل تنزيل الملفات: ${successfulFiles.length} ملف ناجح، ${failedFiles.length} ملف فاشل`);
    
    const reportContent = `
تقرير تنزيل الملفات الداعمة:
===========================
عدد الملفات التي تم تنزيلها بنجاح: ${successfulFiles.length}
عدد الملفات التي فشل تنزيلها: ${failedFiles.length}

${failedFiles.length > 0 ? `الملفات التي فشل تنزيلها:\n${failedFiles.join('\n')}` : ''}
`;
    
    folder.file("_download_report.txt", reportContent);
    console.log(`تم إنشاء تقرير التنزيل. ${successfulFiles.length} ملفات ناجحة، ${failedFiles.length} ملفات فاشلة`);
    
  } catch (error) {
    console.error("خطأ أثناء تنزيل الملفات الداعمة:", error);
    console.error("تفاصيل الخطأ:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "No stack trace available"
    });
    
    // إنشاء تقرير خطأ في حالة فشل عملية التنزيل
    if (folder && typeof folder.file === "function") {
      folder.file("_error_report.txt", `
خطأ أثناء تنزيل الملفات الداعمة:
==============================
${error instanceof Error ? error.message : String(error)}
${error instanceof Error && error.stack ? error.stack : ""}
`);
    }
    
    throw error;
  }
};

/**
 * Download comment attachments and add them to a specified folder
 */
export const downloadCommentAttachments = async (comments: any[], folder: JSZip) => {
  if (!comments || comments.length === 0) {
    console.log("لا توجد مرفقات تعليقات للتنزيل");
    return;
  }
  
  console.log(`محاولة تنزيل مرفقات لـ ${comments.length} تعليق`, {
    folderType: typeof folder,
    folderIsValid: !!folder,
    folderMethods: typeof folder.file === "function" ? "folder.file() متاح" : "folder.file() غير متاح"
  });
  
  try {
    // تحقق من صلاحية كائن JSZip
    if (!folder || typeof folder.file !== "function") {
      console.error("كائن JSZip غير صالح:", folder);
      throw new Error("كائن JSZip غير صالح أو تم تعريفه بشكل غير صحيح");
    }
    
    const attachmentsToDownload = comments.map(async (comment, index) => {
      if (!comment || !comment.attachment_url) {
        console.log(`التعليق #${index + 1} بدون مرفق`, comment?.id);
        return null;
      }
      
      try {
        console.log(`(${index + 1}/${comments.length}) محاولة تنزيل مرفق التعليق: ${comment.attachment_name || 'بدون اسم'}، URL: ${comment.attachment_url}`);
        
        // تحديد اسم الملف
        const fileName = comment.attachment_name || `attachment_${comment.id}`;
        const safeFileName = sanitizeFileName(fileName);
        
        console.time(`download-comment-attachment-${index}`);
        
        try {
          // محاولة تنزيل الملف من URL
          const response = await fetch(comment.attachment_url);
          
          if (!response.ok) {
            throw new Error(`فشل تنزيل الملف: ${response.status} - ${response.statusText}`);
          }
          
          const blob = await response.blob();
          console.timeEnd(`download-comment-attachment-${index}`);
          
          console.log(`تم تنزيل مرفق التعليق بنجاح: ${safeFileName}، الحجم: ${blob.size} بايت، النوع: ${blob.type}`);
          
          if (blob.size === 0) {
            console.warn(`تم تنزيل مرفق التعليق ولكن حجمه 0 بايت: ${safeFileName}`);
          }
          
          // إضافة الملف إلى المجلد
          folder.file(safeFileName, blob);
          
          return {
            name: safeFileName,
            success: true,
            size: blob.size
          } as FileDownloadResult;
        } catch (fetchError) {
          console.error(`خطأ أثناء تنزيل مرفق التعليق من URL:`, fetchError);
          
          // محاولة ثانية باستخدام حزمة أخرى أو طريقة بديلة
          console.log(`محاولة بديلة لتنزيل المرفق باستخدام XMLHttpRequest`);
          
          return new Promise<FileDownloadResult>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', comment.attachment_url, true);
            xhr.responseType = 'blob';
            
            xhr.onload = function() {
              if (this.status === 200) {
                const blob = new Blob([this.response], { type: 'application/octet-stream' });
                console.log(`تم تنزيل المرفق بنجاح باستخدام XHR: ${safeFileName}، الحجم: ${blob.size} بايت`);
                
                folder.file(safeFileName, blob);
                
                resolve({
                  name: safeFileName,
                  success: true,
                  method: "xhr",
                  size: blob.size
                });
              } else {
                console.error(`XHR فشل مع الحالة: ${this.status}`);
                resolve({
                  name: safeFileName,
                  success: false,
                  error: `XHR فشل: ${this.status}`
                });
              }
            };
            
            xhr.onerror = function(e) {
              console.error(`خطأ XHR:`, e);
              resolve({
                name: safeFileName,
                success: false,
                error: `خطأ شبكة XHR`
              });
            };
            
            xhr.send();
          });
        }
        
      } catch (error) {
        console.error(`خطأ في تنزيل مرفق التعليق للتعليق ${comment?.id}:`, error);
        console.error("تفاصيل الخطأ:", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : "No stack trace available"
        });
        
        return {
          name: comment?.attachment_name || `attachment_${comment?.id || 'unknown'}`,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        } as FileDownloadResult;
      }
    });
    
    console.log(`جاري تنزيل ${attachmentsToDownload.length} مرفق تعليق...`);
    
    // انتظار جميع عمليات التنزيل
    const results = await Promise.all(attachmentsToDownload);
    
    // إضافة تقرير عن المرفقات التي تم تنزيلها بنجاح وتلك التي فشل تنزيلها
    // فلتر للحصول على النتائج غير الفارغة (نتائج null تأتي من التعليقات بدون مرفق)
    const validResults = results.filter((r): r is FileDownloadResult => r !== null);
    const successfulFiles = validResults.filter(r => r.success).map(r => r.name);
    const failedFiles = validResults.filter(r => !r.success).map(r => `${r.name} (${r.error})`);
    
    console.log(`اكتمل تنزيل مرفقات التعليقات: ${successfulFiles.length} مرفق ناجح، ${failedFiles.length} مرفق فاشل`);
    
    const reportContent = `
تقرير تنزيل مرفقات التعليقات:
===========================
عدد المرفقات التي تم تنزيلها بنجاح: ${successfulFiles.length}
عدد المرفقات التي فشل تنزيلها: ${failedFiles.length}

${failedFiles.length > 0 ? `المرفقات التي فشل تنزيلها:\n${failedFiles.join('\n')}` : ''}
`;
    
    folder.file("_download_report.txt", reportContent);
    console.log(`تم إنشاء تقرير التنزيل. ${successfulFiles.length} مرفقات ناجحة، ${failedFiles.length} مرفقات فاشلة`);
    
  } catch (error) {
    console.error("خطأ أثناء تنزيل مرفقات التعليقات:", error);
    console.error("تفاصيل الخطأ:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "No stack trace available"
    });
    
    // إنشاء تقرير خطأ في حالة فشل عملية التنزيل
    if (folder && typeof folder.file === "function") {
      folder.file("_error_report.txt", `
خطأ أثناء تنزيل مرفقات التعليقات:
================================
${error instanceof Error ? error.message : String(error)}
${error instanceof Error && error.stack ? error.stack : ""}
`);
    }
    
    throw error;
  }
};
