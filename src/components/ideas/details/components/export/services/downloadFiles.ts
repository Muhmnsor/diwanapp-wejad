
import * as JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeFileName } from "../utils/textUtils";

// Define types for the file download result
export interface FileDownloadResult {
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
  
  console.log(`محاولة تنزيل ${supportingFiles.length} ملف داعم`);
  
  try {
    // تحقق من صلاحية كائن JSZip
    if (!folder || typeof folder.file !== "function") {
      throw new Error("كائن JSZip غير صالح أو تم تعريفه بشكل غير صحيح");
    }
    
    // تحقق من اتصال Supabase
    if (!supabase || !supabase.storage) {
      throw new Error("API Supabase غير متاح");
    }
    
    const results: FileDownloadResult[] = [];
    
    // معالجة كل ملف على حدة (ليس بالتوازي)
    for (let index = 0; index < supportingFiles.length; index++) {
      const file = supportingFiles[index];
      try {
        if (!file || !file.file_path) {
          console.error(`معلومات الملف #${index + 1} غير كاملة:`, file);
          results.push({
            name: file?.name || "ملف غير معروف",
            success: false,
            error: "معلومات الملف غير كاملة"
          });
          continue;
        }
        
        console.log(`(${index + 1}/${supportingFiles.length}) محاولة تنزيل الملف: ${file.name}`);
        
        // طريقة 1: استخدام getPublicUrl
        try {
          const { data: urlData } = supabase.storage
            .from('idea-files')
            .getPublicUrl(file.file_path);
            
          if (urlData?.publicUrl) {
            const fetchResponse = await fetch(urlData.publicUrl);
            
            if (fetchResponse.ok) {
              const fetchedData = await fetchResponse.blob();
              
              if (fetchedData && fetchedData.size > 0) {
                const safeFileName = sanitizeFileName(file.name);
                folder.file(safeFileName, fetchedData);
                
                results.push({
                  name: safeFileName,
                  success: true,
                  method: "publicUrl",
                  size: fetchedData.size
                });
                
                console.log(`تم تنزيل الملف ${file.name} بنجاح عبر URL عام، الحجم: ${fetchedData.size} بايت`);
                continue;
              }
            }
          }
        } catch (publicUrlError) {
          console.warn(`فشل تنزيل الملف باستخدام URL عام:`, publicUrlError);
        }
        
        // طريقة 2: استخدام createSignedUrl
        try {
          const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('idea-files')
            .createSignedUrl(file.file_path, 60);
          
          if (!signedUrlError && signedUrlData?.signedUrl) {
            const fetchResponse = await fetch(signedUrlData.signedUrl);
            
            if (fetchResponse.ok) {
              const fetchedData = await fetchResponse.blob();
              
              if (fetchedData && fetchedData.size > 0) {
                const safeFileName = sanitizeFileName(file.name);
                folder.file(safeFileName, fetchedData);
                
                results.push({
                  name: safeFileName,
                  success: true,
                  method: "signedUrl",
                  size: fetchedData.size
                });
                
                console.log(`تم تنزيل الملف ${file.name} بنجاح عبر URL مُوقّع، الحجم: ${fetchedData.size} بايت`);
                continue;
              }
            }
          }
        } catch (signedUrlError) {
          console.warn(`فشل تنزيل الملف باستخدام URL مُوقّع:`, signedUrlError);
        }
        
        // طريقة 3: استخدام طريقة التنزيل المباشر
        try {
          // استخراج اسم الملف من المسار
          let fileName = file.file_path;
          if (file.file_path.includes('/')) {
            const parts = file.file_path.split('/');
            fileName = parts[parts.length - 1];
          } else if (file.file_path.includes('\\')) {
            const parts = file.file_path.split('\\');
            fileName = parts[parts.length - 1];
          }
          
          const { data: downloadData, error: downloadError } = await supabase.storage
            .from('idea-files')
            .download(fileName);
            
          if (!downloadError && downloadData) {
            const safeFileName = sanitizeFileName(file.name);
            folder.file(safeFileName, downloadData);
            
            results.push({
              name: safeFileName,
              success: true,
              method: "direct-download",
              size: downloadData.size
            });
            
            console.log(`تم تنزيل الملف ${file.name} بنجاح عبر التنزيل المباشر، الحجم: ${downloadData.size} بايت`);
            continue;
          }
          
          // محاولة أخيرة باستخدام المسار الكامل
          const { data: fullPathData, error: fullPathError } = await supabase.storage
            .from('idea-files')
            .download(file.file_path);
            
          if (!fullPathError && fullPathData) {
            const safeFileName = sanitizeFileName(file.name);
            folder.file(safeFileName, fullPathData);
            
            results.push({
              name: safeFileName,
              success: true,
              method: "full-path-download",
              size: fullPathData.size
            });
            
            console.log(`تم تنزيل الملف ${file.name} بنجاح عبر التنزيل بالمسار الكامل، الحجم: ${fullPathData.size} بايت`);
            continue;
          }
          
          // فشلت جميع المحاولات
          results.push({
            name: file.name,
            success: false,
            error: "فشلت جميع طرق التنزيل المتاحة"
          });
          
          console.error(`فشلت جميع محاولات تنزيل الملف ${file.name}`);
          
        } catch (directDownloadError) {
          console.error(`خطأ في التنزيل المباشر للملف ${file.name}:`, directDownloadError);
          
          results.push({
            name: file.name,
            success: false,
            error: directDownloadError instanceof Error ? directDownloadError.message : String(directDownloadError)
          });
        }
        
      } catch (fileError) {
        console.error(`خطأ في تنزيل الملف ${file?.name || 'unknown'}:`, fileError);
        
        results.push({
          name: file?.name || 'unknown',
          success: false,
          error: fileError instanceof Error ? fileError.message : String(fileError)
        });
      }
    }
    
    // إنشاء تقرير بالنتائج
    const successfulFiles = results.filter(r => r.success).map(r => r.name);
    const failedFiles = results.filter(r => !r.success).map(r => `${r.name} (${r.error})`);
    
    console.log(`اكتمل تنزيل الملفات: ${successfulFiles.length} ملف ناجح، ${failedFiles.length} ملف فاشل`);
    
    const reportContent = `
تقرير تنزيل الملفات الداعمة:
===========================
عدد الملفات التي تم تنزيلها بنجاح: ${successfulFiles.length}
عدد الملفات التي فشل تنزيلها: ${failedFiles.length}

${failedFiles.length > 0 ? `الملفات التي فشل تنزيلها:\n${failedFiles.join('\n')}` : ''}
`;
    
    folder.file("_download_report.txt", reportContent);
    
  } catch (error) {
    console.error("خطأ أثناء تنزيل الملفات الداعمة:", error);
    
    // إنشاء تقرير خطأ في حالة فشل عملية التنزيل
    if (folder && typeof folder.file === "function") {
      folder.file("_error_report.txt", `
خطأ أثناء تنزيل الملفات الداعمة:
==============================
${error instanceof Error ? error.message : String(error)}
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
  
  console.log(`محاولة تنزيل مرفقات لـ ${comments.length} تعليق`);
  
  try {
    // تحقق من صلاحية كائن JSZip
    if (!folder || typeof folder.file !== "function") {
      throw new Error("كائن JSZip غير صالح أو تم تعريفه بشكل غير صحيح");
    }
    
    const results: FileDownloadResult[] = [];
    
    // معالجة كل مرفق تعليق على حدة (ليس بالتوازي)
    for (let index = 0; index < comments.length; index++) {
      const comment = comments[index];
      if (!comment || !comment.attachment_url) {
        console.log(`التعليق #${index + 1} بدون مرفق`);
        continue;
      }
      
      try {
        console.log(`(${index + 1}/${comments.length}) محاولة تنزيل مرفق التعليق: ${comment.attachment_name || 'بدون اسم'}`);
        
        // تحديد اسم الملف
        const fileName = comment.attachment_name || `attachment_${comment.id}`;
        const safeFileName = sanitizeFileName(fileName);
        
        // محاولة تنزيل الملف مباشرة من URL
        try {
          const response = await fetch(comment.attachment_url);
          
          if (response.ok) {
            const blob = await response.blob();
            
            if (blob && blob.size > 0) {
              folder.file(safeFileName, blob);
              
              results.push({
                name: safeFileName,
                success: true,
                size: blob.size
              });
              
              console.log(`تم تنزيل مرفق التعليق بنجاح: ${safeFileName}، الحجم: ${blob.size} بايت`);
              continue;
            }
          }
        } catch (fetchError) {
          console.warn(`فشل تنزيل المرفق من URL:`, fetchError);
        }
        
        // محاولة أخرى باستخدام XMLHttpRequest
        try {
          const result = await new Promise<FileDownloadResult>((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', comment.attachment_url, true);
            xhr.responseType = 'blob';
            
            xhr.onload = function() {
              if (this.status === 200) {
                const blob = new Blob([this.response], { type: 'application/octet-stream' });
                folder.file(safeFileName, blob);
                
                resolve({
                  name: safeFileName,
                  success: true,
                  method: "xhr",
                  size: blob.size
                });
                
              } else {
                resolve({
                  name: safeFileName,
                  success: false,
                  error: `XHR فشل: ${this.status}`
                });
              }
            };
            
            xhr.onerror = function() {
              resolve({
                name: safeFileName,
                success: false,
                error: `خطأ شبكة XHR`
              });
            };
            
            xhr.send();
          });
          
          results.push(result);
          
          if (result.success) {
            console.log(`تم تنزيل مرفق التعليق بنجاح باستخدام XHR: ${safeFileName}، الحجم: ${result.size} بايت`);
            continue;
          }
        } catch (xhrError) {
          console.warn(`فشل تنزيل المرفق باستخدام XHR:`, xhrError);
        }
        
        // إذا وصلنا إلى هنا، فشلت جميع المحاولات
        results.push({
          name: safeFileName,
          success: false,
          error: "فشلت جميع طرق التنزيل المتاحة"
        });
        
        console.error(`فشلت جميع محاولات تنزيل مرفق التعليق ${safeFileName}`);
        
      } catch (attachmentError) {
        console.error(`خطأ في تنزيل مرفق التعليق للتعليق ${comment?.id}:`, attachmentError);
        
        results.push({
          name: comment?.attachment_name || `attachment_${comment?.id || 'unknown'}`,
          success: false,
          error: attachmentError instanceof Error ? attachmentError.message : String(attachmentError)
        });
      }
    }
    
    // إنشاء تقرير بالنتائج
    const successfulFiles = results.filter(r => r.success).map(r => r.name);
    const failedFiles = results.filter(r => !r.success).map(r => `${r.name} (${r.error})`);
    
    console.log(`اكتمل تنزيل مرفقات التعليقات: ${successfulFiles.length} مرفق ناجح، ${failedFiles.length} مرفق فاشل`);
    
    const reportContent = `
تقرير تنزيل مرفقات التعليقات:
===========================
عدد المرفقات التي تم تنزيلها بنجاح: ${successfulFiles.length}
عدد المرفقات التي فشل تنزيلها: ${failedFiles.length}

${failedFiles.length > 0 ? `المرفقات التي فشل تنزيلها:\n${failedFiles.join('\n')}` : ''}
`;
    
    folder.file("_download_report.txt", reportContent);
    
  } catch (error) {
    console.error("خطأ أثناء تنزيل مرفقات التعليقات:", error);
    
    // إنشاء تقرير خطأ في حالة فشل عملية التنزيل
    if (folder && typeof folder.file === "function") {
      folder.file("_error_report.txt", `
خطأ أثناء تنزيل مرفقات التعليقات:
================================
${error instanceof Error ? error.message : String(error)}
`);
    }
    
    throw error;
  }
};
