
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
  isPDF?: boolean;
  contentType?: string;
}

// Function to log file details for debugging
const logFileDetails = (file: any, index: number) => {
  console.log(`=== تفاصيل الملف #${index + 1} ===`);
  console.log({
    name: file.name,
    path: file.file_path,
    pathExists: Boolean(file.file_path),
    pathType: typeof file.file_path,
    pathStructure: file.file_path ? file.file_path.split('/') : [],
    // Check if file appears to be a PDF based on name
    isPDFBasedOnName: file.name.toLowerCase().endsWith('.pdf')
  });
  
  // Log the contents of the supabase object
  try {
    console.log('supabase object structure:', {
      storageExists: Boolean(supabase.storage),
      bucketsExist: Boolean(supabase.storage?.from),
      ideaFilesExist: Boolean(supabase.storage?.from('idea-files')),
      publicUrlFnExists: Boolean(supabase.storage?.from('idea-files').getPublicUrl),
      downloadFnExists: Boolean(supabase.storage?.from('idea-files').download),
      createSignedUrlFnExists: Boolean(supabase.storage?.from('idea-files').createSignedUrl)
    });
  } catch (error) {
    console.error('Error inspecting supabase object:', error);
  }
};

/**
 * Download supporting files and add them to a specified folder
 */
export const downloadSupportingFiles = async (supportingFiles: any[], folder: JSZip) => {
  if (!supportingFiles || supportingFiles.length === 0) {
    console.log("لا توجد ملفات داعمة للتنزيل");
    return;
  }
  
  console.log(`=== محاولة تنزيل ${supportingFiles.length} ملف داعم ===`);
  
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
        
        // Log detailed file information
        logFileDetails(file, index);
        
        console.log(`(${index + 1}/${supportingFiles.length}) محاولة تنزيل الملف: ${file.name}`);
        
        // Check if file appears to be PDF based on name
        const isPDFBasedOnName = file.name.toLowerCase().endsWith('.pdf');
        if (isPDFBasedOnName) {
          console.log(`تم اكتشاف ملف PDF (بناءً على الاسم): ${file.name}`);
        }
        
        // طريقة 1: استخدام getPublicUrl
        try {
          console.log(`محاولة تنزيل الملف باستخدام URL عام...`);
          
          const { data: urlData } = supabase.storage
            .from('idea-files')
            .getPublicUrl(file.file_path);
            
          if (urlData?.publicUrl) {
            console.log(`تم الحصول على URL عام: ${urlData.publicUrl}`);
            
            const fetchResponse = await fetch(urlData.publicUrl);
            
            if (fetchResponse.ok) {
              console.log(`تم جلب البيانات بنجاح، حالة الاستجابة: ${fetchResponse.status}`);
              
              const contentType = fetchResponse.headers.get('content-type');
              console.log(`نوع المحتوى: ${contentType}`);
              
              // Better PDF detection
              const isPDFBasedOnContentType = contentType?.includes('pdf');
              if (isPDFBasedOnContentType) {
                console.log(`تم اكتشاف ملف PDF (بناءً على نوع المحتوى)`);
              }
              
              const fetchedData = await fetchResponse.blob();
              
              const isPDF = isPDFBasedOnContentType || 
                          isPDFBasedOnName;
              
              if (fetchedData && fetchedData.size > 0) {
                const safeFileName = sanitizeFileName(file.name);
                folder.file(safeFileName, fetchedData);
                
                results.push({
                  name: safeFileName,
                  success: true,
                  method: "publicUrl",
                  size: fetchedData.size,
                  isPDF: isPDF,
                  contentType: contentType || undefined
                });
                
                console.log(`تم تنزيل الملف ${file.name} بنجاح عبر URL عام، الحجم: ${fetchedData.size} بايت`);
                
                // اختبار إذا كان PDF
                if (isPDF) {
                  console.log(`الملف ${file.name} هو ملف PDF`);
                }
                
                continue;
              } else {
                console.warn(`البيانات المستلمة فارغة أو حجمها 0 بايت`);
              }
            } else {
              console.warn(`فشل جلب البيانات. حالة الاستجابة: ${fetchResponse.status}`);
            }
          } else {
            console.warn(`لم نستطع الحصول على URL عام للملف`);
          }
        } catch (publicUrlError) {
          console.warn(`فشل تنزيل الملف باستخدام URL عام:`, publicUrlError);
        }
        
        // طريقة 2: استخدام createSignedUrl
        try {
          console.log(`محاولة تنزيل الملف باستخدام URL مُوقّع...`);
          
          const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('idea-files')
            .createSignedUrl(file.file_path, 60);
          
          if (!signedUrlError && signedUrlData?.signedUrl) {
            console.log(`تم الحصول على URL مُوقّع: ${signedUrlData.signedUrl}`);
            
            const fetchResponse = await fetch(signedUrlData.signedUrl);
            
            if (fetchResponse.ok) {
              console.log(`تم جلب البيانات بنجاح، حالة الاستجابة: ${fetchResponse.status}`);
              
              const contentType = fetchResponse.headers.get('content-type');
              console.log(`نوع المحتوى: ${contentType}`);
              
              // Better PDF detection
              const isPDFBasedOnContentType = contentType?.includes('pdf');
              if (isPDFBasedOnContentType) {
                console.log(`تم اكتشاف ملف PDF (بناءً على نوع المحتوى)`);
              }
              
              const fetchedData = await fetchResponse.blob();
              
              const isPDF = isPDFBasedOnContentType || 
                          isPDFBasedOnName;
              
              if (fetchedData && fetchedData.size > 0) {
                const safeFileName = sanitizeFileName(file.name);
                folder.file(safeFileName, fetchedData);
                
                results.push({
                  name: safeFileName,
                  success: true,
                  method: "signedUrl",
                  size: fetchedData.size,
                  isPDF: isPDF,
                  contentType: contentType || undefined
                });
                
                console.log(`تم تنزيل الملف ${file.name} بنجاح عبر URL مُوقّع، الحجم: ${fetchedData.size} بايت`);
                
                // اختبار إذا كان PDF
                if (isPDF) {
                  console.log(`الملف ${file.name} هو ملف PDF`);
                }
                
                continue;
              } else {
                console.warn(`البيانات المستلمة فارغة أو حجمها 0 بايت`);
              }
            } else {
              console.warn(`فشل جلب البيانات. حالة الاستجابة: ${fetchResponse.status}`);
            }
          } else {
            console.warn(`لم نستطع الحصول على URL مُوقّع للملف. الخطأ:`, signedUrlError);
          }
        } catch (signedUrlError) {
          console.warn(`فشل تنزيل الملف باستخدام URL مُوقّع:`, signedUrlError);
        }
        
        // طريقة 3: استخدام طريقة التنزيل المباشر
        try {
          console.log(`محاولة تنزيل الملف عبر التنزيل المباشر...`);
          console.log(`مسار الملف للتنزيل المباشر: ${file.file_path}`);
          
          // تجربة بالاسم الكامل أولاً
          const { data: downloadData, error: downloadError } = await supabase.storage
            .from('idea-files')
            .download(file.file_path);
          
          if (!downloadError && downloadData) {
            console.log(`تم تنزيل الملف بنجاح، الحجم: ${downloadData.size}`);
            console.log(`نوع المحتوى: ${downloadData.type}`);
            
            // Better PDF detection
            const isPDFBasedOnType = downloadData.type.includes('pdf');
            if (isPDFBasedOnType) {
              console.log(`تم اكتشاف ملف PDF (بناءً على نوع المحتوى)`);
            }
            
            const isPDF = isPDFBasedOnType || 
                        isPDFBasedOnName;
            
            const safeFileName = sanitizeFileName(file.name);
            folder.file(safeFileName, downloadData);
            
            results.push({
              name: safeFileName,
              success: true,
              method: "direct-download",
              size: downloadData.size,
              isPDF: isPDF,
              contentType: downloadData.type
            });
            
            console.log(`تم تنزيل الملف ${file.name} بنجاح عبر التنزيل المباشر، الحجم: ${downloadData.size} بايت`);
            
            // اختبار إذا كان PDF
            if (isPDF) {
              console.log(`الملف ${file.name} هو ملف PDF`);
            }
            
            continue;
          } else {
            console.warn(`فشل تنزيل الملف مباشرة. الخطأ:`, downloadError);
            
            // محاولة استخراج الاسم من المسار
            console.log(`محاولة استخراج اسم الملف من المسار: ${file.file_path}`);
            
            let fileName = file.file_path;
            if (file.file_path.includes('/')) {
              const parts = file.file_path.split('/');
              fileName = parts[parts.length - 1];
              console.log(`تم استخراج اسم الملف من المسار (/)): ${fileName}`);
            } else if (file.file_path.includes('\\')) {
              const parts = file.file_path.split('\\');
              fileName = parts[parts.length - 1];
              console.log(`تم استخراج اسم الملف من المسار (\\): ${fileName}`);
            }
            
            console.log(`اسم الملف المستخرج: ${fileName}`);
            
            const { data: filenameData, error: filenameError } = await supabase.storage
              .from('idea-files')
              .download(fileName);
              
            if (!filenameError && filenameData) {
              console.log(`تم تنزيل الملف بنجاح بالاسم المستخرج، الحجم: ${filenameData.size}`);
              console.log(`نوع المحتوى: ${filenameData.type}`);
              
              // Better PDF detection
              const isPDFBasedOnType = filenameData.type.includes('pdf');
              if (isPDFBasedOnType) {
                console.log(`تم اكتشاف ملف PDF (بناءً على نوع المحتوى)`);
              }
              
              const isPDF = isPDFBasedOnType || 
                          isPDFBasedOnName;
              
              const safeFileName = sanitizeFileName(file.name);
              folder.file(safeFileName, filenameData);
              
              results.push({
                name: safeFileName,
                success: true,
                method: "filename-download",
                size: filenameData.size,
                isPDF: isPDF,
                contentType: filenameData.type
              });
              
              console.log(`تم تنزيل الملف ${file.name} بنجاح باسم الملف المستخرج، الحجم: ${filenameData.size} بايت`);
              
              // اختبار إذا كان PDF
              if (isPDF) {
                console.log(`الملف ${file.name} هو ملف PDF`);
              }
              
              continue;
            } else {
              console.warn(`فشل تنزيل الملف باسم الملف المستخرج. الخطأ:`, filenameError);
            }
          }
        } catch (directDownloadError) {
          console.error(`خطأ في التنزيل المباشر للملف ${file.name}:`, directDownloadError);
        }
        
        // فشلت جميع المحاولات
        results.push({
          name: file.name,
          success: false,
          error: "فشلت جميع طرق التنزيل المتاحة"
        });
        
        console.error(`فشلت جميع محاولات تنزيل الملف ${file.name}`);
        
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
    const pdfFiles = results.filter(r => r.isPDF && r.success).map(r => r.name);
    
    console.log(`اكتمل تنزيل الملفات: ${successfulFiles.length} ملف ناجح، ${failedFiles.length} ملف فاشل`);
    console.log(`عدد ملفات PDF التي تم تنزيلها: ${pdfFiles.length}`);
    
    // Log detailed results
    console.log("نتائج التنزيل المفصلة:", results);
    
    const reportContent = `
تقرير تنزيل الملفات الداعمة:
===========================
عدد الملفات التي تم تنزيلها بنجاح: ${successfulFiles.length}
عدد الملفات التي فشل تنزيلها: ${failedFiles.length}
عدد ملفات PDF التي تم تنزيلها: ${pdfFiles.length}

تفاصيل الملفات الناجحة:
${results.filter(r => r.success).map(r => `- ${r.name} (${r.method}, ${r.size} بايت, نوع المحتوى: ${r.contentType || 'غير معروف'}, PDF: ${r.isPDF ? 'نعم' : 'لا'})`).join('\n')}

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
${error instanceof Error && error.stack ? '\nStack Trace:\n' + error.stack : ''}
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
  
  console.log(`=== محاولة تنزيل مرفقات لـ ${comments.length} تعليق ===`);
  
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
        console.log(`=== معلومات مرفق التعليق #${index + 1} ===`);
        
        // Check if attachment appears to be PDF based on URL or name
        const isPDFBasedOnUrl = comment.attachment_url?.toLowerCase().includes('.pdf');
        const isPDFBasedOnName = comment.attachment_name?.toLowerCase().endsWith('.pdf');
        const isPDFBasedOnType = comment.attachment_type?.includes('pdf');
        
        console.log({
          commentId: comment.id,
          attachmentName: comment.attachment_name || 'بدون اسم',
          attachmentUrl: comment.attachment_url,
          urlType: typeof comment.attachment_url,
          hasValidUrl: !!comment.attachment_url,
          attachmentType: comment.attachment_type || 'غير معروف',
          isPdfBasedOnUrl: isPDFBasedOnUrl,
          isPdfBasedOnName: isPDFBasedOnName,
          isPdfBasedOnType: isPDFBasedOnType
        });
        
        if (isPDFBasedOnUrl || isPDFBasedOnName || isPDFBasedOnType) {
          console.log(`تم اكتشاف ملف PDF في مرفق التعليق: ${comment.attachment_name || 'بدون اسم'}`);
        }
        
        console.log(`(${index + 1}/${comments.length}) محاولة تنزيل مرفق التعليق: ${comment.attachment_name || 'بدون اسم'}`);
        
        // تحديد اسم الملف
        const fileName = comment.attachment_name || `attachment_${comment.id}`;
        const safeFileName = sanitizeFileName(fileName);
        
        // محاولة تنزيل الملف مباشرة من URL
        try {
          console.log(`محاولة تنزيل المرفق مباشرة من URL العام: ${comment.attachment_url}`);
          
          const response = await fetch(comment.attachment_url);
          
          if (response.ok) {
            console.log(`تم جلب البيانات بنجاح، حالة الاستجابة: ${response.status}`);
            
            const contentType = response.headers.get('content-type');
            console.log(`نوع المحتوى: ${contentType}`);
            
            // Better PDF detection with content type
            const isPDFBasedOnContentType = contentType?.includes('pdf');
            if (isPDFBasedOnContentType) {
              console.log(`تم اكتشاف ملف PDF (بناءً على نوع المحتوى)`);
            }
            
            const blob = await response.blob();
            
            const isPDF = isPDFBasedOnContentType || 
                        isPDFBasedOnUrl || 
                        isPDFBasedOnName || 
                        isPDFBasedOnType;
            
            if (blob && blob.size > 0) {
              folder.file(safeFileName, blob);
              
              results.push({
                name: safeFileName,
                success: true,
                method: "direct-url",
                size: blob.size,
                isPDF: isPDF,
                contentType: contentType || undefined
              });
              
              console.log(`تم تنزيل مرفق التعليق بنجاح: ${safeFileName}، الحجم: ${blob.size} بايت`);
              
              // اختبار إذا كان PDF
              if (isPDF) {
                console.log(`الملف ${safeFileName} هو ملف PDF`);
              }
              
              continue;
            } else {
              console.warn(`البيانات المستلمة فارغة أو حجمها 0 بايت`);
            }
          } else {
            console.warn(`فشل جلب البيانات. حالة الاستجابة: ${response.status}`);
          }
        } catch (fetchError) {
          console.warn(`فشل تنزيل المرفق من URL:`, fetchError);
        }
        
        // محاولة أخرى باستخدام XMLHttpRequest
        try {
          console.log(`محاولة تنزيل المرفق باستخدام XMLHttpRequest...`);
          
          const result = await new Promise<FileDownloadResult>((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', comment.attachment_url, true);
            xhr.responseType = 'blob';
            
            xhr.onload = function() {
              if (this.status === 200) {
                console.log(`تم جلب البيانات بنجاح باستخدام XHR، حالة الاستجابة: ${this.status}`);
                
                const blobType = this.response.type;
                console.log(`نوع المحتوى: ${blobType}`);
                
                // Better PDF detection with response type
                const isPDFBasedOnResponseType = blobType?.includes('pdf');
                if (isPDFBasedOnResponseType) {
                  console.log(`تم اكتشاف ملف PDF (بناءً على نوع XHR response)`);
                }
                
                const blob = new Blob([this.response], { type: blobType || 'application/octet-stream' });
                
                const isPDF = isPDFBasedOnResponseType || 
                            isPDFBasedOnUrl || 
                            isPDFBasedOnName || 
                            isPDFBasedOnType;
                
                folder.file(safeFileName, blob);
                
                resolve({
                  name: safeFileName,
                  success: true,
                  method: "xhr",
                  size: blob.size,
                  isPDF: isPDF,
                  contentType: blobType
                });
                
                // اختبار إذا كان PDF
                if (isPDF) {
                  console.log(`الملف ${safeFileName} هو ملف PDF`);
                }
                
              } else {
                console.warn(`فشل جلب البيانات باستخدام XHR. حالة الاستجابة: ${this.status}`);
                
                resolve({
                  name: safeFileName,
                  success: false,
                  error: `XHR فشل: ${this.status}`
                });
              }
            };
            
            xhr.onerror = function() {
              console.error(`خطأ شبكة أثناء استخدام XHR`);
              
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
    const pdfFiles = results.filter(r => r.isPDF && r.success).map(r => r.name);
    
    console.log(`اكتمل تنزيل مرفقات التعليقات: ${successfulFiles.length} مرفق ناجح، ${failedFiles.length} مرفق فاشل`);
    console.log(`عدد ملفات PDF التي تم تنزيلها: ${pdfFiles.length}`);
    
    // Log detailed results
    console.log("نتائج تنزيل المرفقات المفصلة:", results);
    
    const reportContent = `
تقرير تنزيل مرفقات التعليقات:
===========================
عدد المرفقات التي تم تنزيلها بنجاح: ${successfulFiles.length}
عدد المرفقات التي فشل تنزيلها: ${failedFiles.length}
عدد ملفات PDF التي تم تنزيلها: ${pdfFiles.length}

تفاصيل الملفات الناجحة:
${results.filter(r => r.success).map(r => `- ${r.name} (${r.method}, ${r.size} بايت, نوع المحتوى: ${r.contentType || 'غير معروف'}, PDF: ${r.isPDF ? 'نعم' : 'لا'})`).join('\n')}

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
${error instanceof Error && error.stack ? '\nStack Trace:\n' + error.stack : ''}
`);
    }
    
    throw error;
  }
};
