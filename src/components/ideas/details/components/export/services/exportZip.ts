
import * as JSZip from "jszip";
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
  console.log("Starting ZIP export process with data:", Object.keys(data));
  console.log("بيانات JSZip:", {
    version: JSZip.version || "unknown",
    isAvailable: typeof JSZip === "function"
  });
  console.log("بيانات FileSaver:", {
    isAvailable: typeof saveAs === "function"
  });
  
  // التحقق من البيانات قبل البدء
  if (!data || !data.idea) {
    console.error("بيانات الفكرة غير كاملة أو غير صالحة:", data);
    throw new Error("بيانات الفكرة غير كاملة أو غير صالحة");
  }
  
  try {
    // إنشاء كائن JSZip جديد
    console.log("محاولة إنشاء كائن JSZip جديد");
    let zip: JSZip;
    try {
      zip = new JSZip();
      console.log("تم إنشاء كائن JSZip بنجاح", {
        zipType: typeof zip,
        zipMethods: Object.keys(zip),
      });
    } catch (zipError) {
      console.error("خطأ في إنشاء كائن JSZip:", zipError);
      throw new Error(`فشل إنشاء كائن JSZip: ${zipError instanceof Error ? zipError.message : String(zipError)}`);
    }
    
    // Add a file for the idea
    console.log("إضافة محتوى الفكرة الأساسي للملف المضغوط");
    const ideaContent = generateIdeaTextContent(data.idea);
    try {
      zip.file("idea.txt", ideaContent);
      console.log("تم إضافة محتوى الفكرة بنجاح، حجم المحتوى:", ideaContent.length);
    } catch (fileError) {
      console.error("خطأ في إضافة ملف الفكرة:", fileError);
      throw new Error(`فشل إضافة ملف الفكرة: ${fileError instanceof Error ? fileError.message : String(fileError)}`);
    }
    
    // Add a file for comments if available
    if (data.comments && data.comments.length > 0) {
      console.log(`Adding ${data.comments.length} comments to ZIP`);
      try {
        const commentsContent = generateCommentsTextContent(data.comments);
        zip.file("comments.txt", commentsContent);
        console.log("تم إضافة التعليقات بنجاح، حجم المحتوى:", commentsContent.length);
      } catch (commentsError) {
        console.error("خطأ في إضافة ملف التعليقات:", commentsError);
        // نستمر رغم الخطأ
      }
    }
    
    // Add a file for votes if available
    if (data.votes && data.votes.length > 0) {
      console.log(`Adding ${data.votes.length} votes to ZIP`);
      try {
        const votesContent = generateVotesTextContent(data.votes);
        zip.file("votes.txt", votesContent);
        console.log("تم إضافة الأصوات بنجاح، حجم المحتوى:", votesContent.length);
      } catch (votesError) {
        console.error("خطأ في إضافة ملف الأصوات:", votesError);
        // نستمر رغم الخطأ
      }
    }
    
    // Add a file for the decision if available
    if (data.decision) {
      console.log("Adding decision data to ZIP");
      try {
        const decisionContent = generateDecisionTextContent(data.decision);
        zip.file("decision.txt", decisionContent);
        console.log("تم إضافة القرار بنجاح، حجم المحتوى:", decisionContent.length);
      } catch (decisionError) {
        console.error("خطأ في إضافة ملف القرار:", decisionError);
        // نستمر رغم الخطأ
      }
    }
    
    // Add a folder for attachment information
    console.log("محاولة إنشاء مجلد معلومات المرفقات");
    const attachmentsFolder = zip.folder("attachments_info");
    if (!attachmentsFolder) {
      console.warn("فشل إنشاء مجلد المرفقات في الملف المضغوط");
    } else {
      console.log("تم إنشاء مجلد معلومات المرفقات بنجاح");
    }
    
    // Add supporting files information
    const supportingFiles = data.idea.supporting_files;
    
    if (supportingFiles && Array.isArray(supportingFiles) && supportingFiles.length > 0) {
      console.log(`Processing ${supportingFiles.length} supporting files`, {
        fileDetails: supportingFiles.map(file => ({
          name: file.name,
          path: file.file_path,
          hasValidPath: !!file.file_path
        }))
      });
      
      // Create text file with file information
      try {
        const supportingFilesInfoText = "الملفات الداعمة للفكرة (روابط فقط):\n\n" + 
          supportingFiles.map((file: any, index: number) => 
            `${index + 1}. ${file.name}: ${file.file_path}`
          ).join("\n");
        
        if (attachmentsFolder) {
          attachmentsFolder.file("supporting_files_info.txt", supportingFilesInfoText);
          console.log("تم إضافة معلومات الملفات الداعمة، حجم المحتوى:", supportingFilesInfoText.length);
        }
      } catch (infoError) {
        console.error("خطأ في إضافة معلومات الملفات الداعمة:", infoError);
        // نستمر رغم الخطأ
      }
      
      // If download_files option is selected
      if (exportOptions.includes("download_files")) {
        console.log("بدء تنزيل الملفات المرفقة (تم اختيار خيار تنزيل الملفات)");
        
        console.log("محاولة إنشاء مجلد الملفات");
        const filesFolder = zip.folder("files");
        
        if (!filesFolder) {
          console.warn("فشل إنشاء مجلد الملفات في الملف المضغوط");
        } else {
          console.log("تم إنشاء مجلد الملفات بنجاح");
          // Download supporting files
          try {
            console.time("download-supporting-files");
            await downloadSupportingFiles(supportingFiles, filesFolder);
            console.timeEnd("download-supporting-files");
            console.log("تم تنزيل الملفات المرفقة بنجاح");
          } catch (filesError) {
            console.error("حدث خطأ أثناء تنزيل الملفات المرفقة:", filesError);
            console.error("تفاصيل الخطأ:", {
              message: filesError instanceof Error ? filesError.message : String(filesError),
              stack: filesError instanceof Error ? filesError.stack : "No stack trace available"
            });
            // نستمر في العملية حتى لو فشل تنزيل الملفات المرفقة
          }
        }
      } else {
        console.log("تم تخطي تنزيل الملفات (لم يتم اختيار الخيار)");
      }
    } else {
      console.log("لا توجد ملفات مرفقة للفكرة", {
        supportingFiles,
        isArray: Array.isArray(supportingFiles),
        length: supportingFiles?.length
      });
    }
    
    // Add comment attachments information
    if (data.comments && Array.isArray(data.comments)) {
      const commentsWithAttachments = data.comments.filter((comment: any) => comment.attachment_url);
      if (commentsWithAttachments.length > 0) {
        console.log(`Processing ${commentsWithAttachments.length} comment attachments`);
        
        try {
          const commentAttachmentsInfoText = "مرفقات التعليقات (روابط فقط):\n\n" + 
            commentsWithAttachments.map((comment: any, index: number) => 
              `${index + 1}. ${comment.attachment_name || 'ملف مرفق'}: ${comment.attachment_url}`
            ).join("\n");
          
          if (attachmentsFolder) {
            attachmentsFolder.file("comment_attachments_info.txt", commentAttachmentsInfoText);
            console.log("تم إضافة معلومات مرفقات التعليقات، حجم المحتوى:", commentAttachmentsInfoText.length);
          }
        } catch (infoError) {
          console.error("خطأ في إضافة معلومات مرفقات التعليقات:", infoError);
          // نستمر رغم الخطأ
        }
        
        // If download_files option is selected
        if (exportOptions.includes("download_files")) {
          console.log("محاولة إنشاء مجلد مرفقات التعليقات");
          const commentsFolder = zip.folder("comment_attachments");
          
          if (!commentsFolder) {
            console.warn("فشل إنشاء مجلد مرفقات التعليقات في الملف المضغوط");
          } else {
            console.log("تم إنشاء مجلد مرفقات التعليقات بنجاح");
            // Download comment attachments
            try {
              console.time("download-comment-attachments");
              await downloadCommentAttachments(commentsWithAttachments, commentsFolder);
              console.timeEnd("download-comment-attachments");
              console.log("تم تنزيل مرفقات التعليقات بنجاح");
            } catch (commentsError) {
              console.error("حدث خطأ أثناء تنزيل مرفقات التعليقات:", commentsError);
              console.error("تفاصيل الخطأ:", {
                message: commentsError instanceof Error ? commentsError.message : String(commentsError),
                stack: commentsError instanceof Error ? commentsError.stack : "No stack trace available"
              });
              // نستمر في العملية حتى لو فشل تنزيل مرفقات التعليقات
            }
          }
        }
      } else {
        console.log("لا توجد مرفقات للتعليقات");
      }
    }
    
    // Create and download the ZIP file
    console.log("بدء عملية توليد ملف ZIP...");
    
    try {
      console.time("generate-zip-async");
      
      // تحقق من حجم محتويات ZIP قبل الضغط
      let totalSize = 0;
      Object.values(zip.files).forEach((file: any) => {
        if (file._data && file._data.uncompressedSize) {
          totalSize += file._data.uncompressedSize;
        }
      });
      console.log(`إجمالي حجم البيانات قبل الضغط: ${totalSize} بايت`);
      
      console.log("جاري توليد ملف ZIP...");
      
      // استخدام حجم أقل للضغط لتجنب المشاكل
      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 3  // استخدام مستوى ضغط متوسط لتجنب المشاكل
        }
      });
      
      console.timeEnd("generate-zip-async");
      
      if (!zipBlob) {
        throw new Error("فشل إنشاء ملف ZIP (النتيجة فارغة)");
      }
      
      if (zipBlob.size === 0) {
        throw new Error("فشل إنشاء ملف ZIP (حجم الملف 0)");
      }
      
      console.log(`تم إنشاء ملف ZIP بنجاح. حجم الملف: ${zipBlob.size} بايت، نوع البيانات: ${zipBlob.type}`);
      
      const fileName = sanitizeFileName(`فكرة-${ideaTitle}.zip`);
      console.log(`Saving ZIP file as: ${fileName}`);
      
      // حفظ الملف باستخدام طريقة بديلة أولاً
      console.time("download-zip-file");
      console.log("بدء عملية حفظ الملف...");
      
      try {
        console.log("استخدام طريقة التنزيل المباشر");
        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        
        // تنظيف
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          console.log("تم تنظيف الموارد بعد الاستخدام المباشر");
        }, 500);
      } catch (directError) {
        console.error("خطأ في طريقة التنزيل المباشر:", directError);
        
        // محاولة استخدام saveAs كخطة بديلة
        console.log("محاولة استخدام FileSaver.saveAs كخطة بديلة");
        try {
          saveAs(zipBlob, fileName);
          console.log("تم استخدام FileSaver.saveAs بنجاح");
        } catch (saveError) {
          console.error("فشل أيضًا استخدام FileSaver.saveAs:", saveError);
          throw new Error(`فشل تنزيل الملف: ${saveError instanceof Error ? saveError.message : String(saveError)}`);
        }
      }
      
      console.timeEnd("download-zip-file");
      
    } catch (zipGenError) {
      console.error("خطأ أثناء إنشاء أو حفظ ملف ZIP:", zipGenError);
      console.error("تفاصيل الخطأ:", {
        message: zipGenError instanceof Error ? zipGenError.message : String(zipGenError),
        stack: zipGenError instanceof Error ? zipGenError.stack : "No stack trace available"
      });
      throw new Error(`فشل توليد ملف ZIP: ${zipGenError instanceof Error ? zipGenError.message : String(zipGenError)}`);
    }
    
  } catch (error) {
    console.error("خطأ في إنشاء ملف ZIP:", error);
    console.error("تفاصيل الخطأ:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "No stack trace available"
    });
    throw new Error(`فشل إنشاء ملف ZIP: ${error instanceof Error ? error.message : String(error)}`);
  }
};
