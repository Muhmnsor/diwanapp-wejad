
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
  
  // التحقق من البيانات قبل البدء
  if (!data || !data.idea) {
    console.error("بيانات الفكرة غير كاملة أو غير صالحة:", data);
    throw new Error("بيانات الفكرة غير كاملة أو غير صالحة");
  }
  
  const zip = new JSZip();
  
  try {
    // Add a file for the idea
    console.log("إضافة محتوى الفكرة الأساسي للملف المضغوط");
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
    if (!attachmentsFolder) {
      console.warn("فشل إنشاء مجلد المرفقات في الملف المضغوط");
    } else {
      console.log("تم إنشاء مجلد معلومات المرفقات");
    }
    
    // Add supporting files information
    const supportingFiles = data.idea.supporting_files;
    if (supportingFiles && Array.isArray(supportingFiles) && supportingFiles.length > 0) {
      console.log(`Processing ${supportingFiles.length} supporting files`);
      const supportingFilesInfoText = "الملفات الداعمة للفكرة (روابط فقط):\n\n" + 
        supportingFiles.map((file: any, index: number) => 
          `${index + 1}. ${file.name}: ${file.file_path}`
        ).join("\n");
      
      attachmentsFolder?.file("supporting_files_info.txt", supportingFilesInfoText);
      
      // If download_files option is selected
      if (exportOptions.includes("download_files")) {
        console.log("بدء تنزيل الملفات المرفقة (تم اختيار خيار تنزيل الملفات)");
        const filesFolder = zip.folder("files");
        
        if (!filesFolder) {
          console.warn("فشل إنشاء مجلد الملفات في الملف المضغوط");
        } else {
          // Download supporting files
          try {
            await downloadSupportingFiles(supportingFiles, filesFolder);
            console.log("تم تنزيل الملفات المرفقة بنجاح");
          } catch (filesError) {
            console.error("حدث خطأ أثناء تنزيل الملفات المرفقة:", filesError);
            // نستمر في العملية حتى لو فشل تنزيل الملفات المرفقة
          }
        }
      } else {
        console.log("تم تخطي تنزيل الملفات (لم يتم اختيار الخيار)");
      }
    } else {
      console.log("لا توجد ملفات مرفقة للفكرة");
    }
    
    // Add comment attachments information
    if (data.comments && Array.isArray(data.comments)) {
      const commentsWithAttachments = data.comments.filter((comment: any) => comment.attachment_url);
      if (commentsWithAttachments.length > 0) {
        console.log(`Processing ${commentsWithAttachments.length} comment attachments`);
        const commentAttachmentsInfoText = "مرفقات التعليقات (روابط فقط):\n\n" + 
          commentsWithAttachments.map((comment: any, index: number) => 
            `${index + 1}. ${comment.attachment_name || 'ملف مرفق'}: ${comment.attachment_url}`
          ).join("\n");
        
        attachmentsFolder?.file("comment_attachments_info.txt", commentAttachmentsInfoText);
        
        // If download_files option is selected
        if (exportOptions.includes("download_files")) {
          const commentsFolder = zip.folder("comment_attachments");
          
          if (!commentsFolder) {
            console.warn("فشل إنشاء مجلد مرفقات التعليقات في الملف المضغوط");
          } else {
            // Download comment attachments
            try {
              await downloadCommentAttachments(commentsWithAttachments, commentsFolder);
              console.log("تم تنزيل مرفقات التعليقات بنجاح");
            } catch (commentsError) {
              console.error("حدث خطأ أثناء تنزيل مرفقات التعليقات:", commentsError);
              // نستمر في العملية حتى لو فشل تنزيل مرفقات التعليقات
            }
          }
        }
      } else {
        console.log("لا توجد مرفقات للتعليقات");
      }
    }
    
    // Create and download the ZIP file
    console.log("توليد ملف ZIP...");
    
    try {
      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 5
        }
      });
      
      if (!zipBlob || zipBlob.size === 0) {
        throw new Error("فشل إنشاء ملف ZIP (حجم الملف 0)");
      }
      
      console.log(`تم إنشاء ملف ZIP بنجاح. حجم الملف: ${zipBlob.size} بايت`);
      
      const fileName = sanitizeFileName(`فكرة-${ideaTitle}.zip`);
      console.log(`Saving ZIP file as: ${fileName}`);
      
      // التحقق من أن ملف zip تم إنشاؤه بشكل صحيح
      if (zipBlob.size > 0) {
        saveAs(zipBlob, fileName);
        console.log("تم حفظ ملف ZIP بنجاح");
      } else {
        throw new Error("فشل إنشاء ملف ZIP (حجم الملف 0 بايت)");
      }
      
    } catch (zipGenError) {
      console.error("خطأ أثناء إنشاء أو حفظ ملف ZIP:", zipGenError);
      throw new Error(`فشل توليد ملف ZIP: ${zipGenError instanceof Error ? zipGenError.message : String(zipGenError)}`);
    }
    
  } catch (error) {
    console.error("خطأ في إنشاء ملف ZIP:", error);
    throw new Error(`فشل إنشاء ملف ZIP: ${error instanceof Error ? error.message : String(error)}`);
  }
};
