
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
  
  try {
    // إنشاء كائن JSZip جديد
    console.log("محاولة إنشاء كائن JSZip جديد");
    let zip = new JSZip();
    console.log("تم إنشاء كائن JSZip بنجاح");
    
    // Add a file for the idea
    console.log("إضافة محتوى الفكرة الأساسي للملف المضغوط");
    const ideaContent = generateIdeaTextContent(data.idea);
    zip.file("idea.txt", ideaContent);
    console.log("تم إضافة محتوى الفكرة بنجاح، حجم المحتوى:", ideaContent.length);
    
    // Add a file for comments if available
    if (data.comments && data.comments.length > 0) {
      console.log(`Adding ${data.comments.length} comments to ZIP`);
      const commentsContent = generateCommentsTextContent(data.comments);
      zip.file("comments.txt", commentsContent);
      console.log("تم إضافة التعليقات بنجاح، حجم المحتوى:", commentsContent.length);
    }
    
    // Add a file for votes if available
    if (data.votes && data.votes.length > 0) {
      console.log(`Adding ${data.votes.length} votes to ZIP`);
      const votesContent = generateVotesTextContent(data.votes);
      zip.file("votes.txt", votesContent);
      console.log("تم إضافة الأصوات بنجاح، حجم المحتوى:", votesContent.length);
    }
    
    // Add a file for the decision if available
    if (data.decision) {
      console.log("Adding decision data to ZIP");
      const decisionContent = generateDecisionTextContent(data.decision);
      zip.file("decision.txt", decisionContent);
      console.log("تم إضافة القرار بنجاح، حجم المحتوى:", decisionContent.length);
    }
    
    // Add a folder for attachment information
    const attachmentsFolder = zip.folder("attachments_info");
    if (!attachmentsFolder) {
      console.warn("فشل إنشاء مجلد المرفقات في الملف المضغوط");
    } else {
      console.log("تم إنشاء مجلد معلومات المرفقات بنجاح");
    }
    
    // Determine if we should download files
    const shouldDownloadFiles = exportOptions.includes("download_files");
    
    // Add supporting files information and download if needed
    const supportingFiles = data.idea.supporting_files;
    
    if (supportingFiles && Array.isArray(supportingFiles) && supportingFiles.length > 0) {
      console.log(`Processing ${supportingFiles.length} supporting files`);
      
      // Create text file with file information
      const supportingFilesInfoText = "الملفات الداعمة للفكرة (روابط فقط):\n\n" + 
        supportingFiles.map((file: any, index: number) => 
          `${index + 1}. ${file.name}: ${file.file_path}`
        ).join("\n");
      
      if (attachmentsFolder) {
        attachmentsFolder.file("supporting_files_info.txt", supportingFilesInfoText);
        console.log("تم إضافة معلومات الملفات الداعمة، حجم المحتوى:", supportingFilesInfoText.length);
      }
      
      // If download_files option is selected
      if (shouldDownloadFiles) {
        console.log("بدء تنزيل الملفات المرفقة (تم اختيار خيار تنزيل الملفات)");
        
        const filesFolder = zip.folder("files");
        
        if (!filesFolder) {
          console.warn("فشل إنشاء مجلد الملفات في الملف المضغوط");
        } else {
          console.log("تم إنشاء مجلد الملفات بنجاح");
          
          try {
            console.time("download-supporting-files");
            await downloadSupportingFiles(supportingFiles, filesFolder);
            console.timeEnd("download-supporting-files");
            console.log("تم تنزيل الملفات المرفقة بنجاح");
          } catch (filesError) {
            console.error("حدث خطأ أثناء تنزيل الملفات المرفقة:", filesError);
            
            // رسالة خطأ للمستخدم
            zip.file("_download_errors.txt", 
              `حدث خطأ أثناء تنزيل بعض الملفات المرفقة:\n${filesError instanceof Error ? filesError.message : String(filesError)}\n\n` +
              "يحتوي الملف المضغوط على معلومات الفكرة والمناقشات والتصويتات، لكن قد تكون بعض الملفات المرفقة مفقودة."
            );
          }
        }
      } else {
        console.log("تم تخطي تنزيل الملفات (لم يتم اختيار الخيار)");
      }
    } else {
      console.log("لا توجد ملفات مرفقة للفكرة");
    }
    
    // Add comment attachments information and download if needed
    if (data.comments && Array.isArray(data.comments)) {
      const commentsWithAttachments = data.comments.filter((comment: any) => comment.attachment_url);
      if (commentsWithAttachments.length > 0) {
        console.log(`Processing ${commentsWithAttachments.length} comment attachments`);
        
        const commentAttachmentsInfoText = "مرفقات التعليقات (روابط فقط):\n\n" + 
          commentsWithAttachments.map((comment: any, index: number) => 
            `${index + 1}. ${comment.attachment_name || 'ملف مرفق'}: ${comment.attachment_url}`
          ).join("\n");
        
        if (attachmentsFolder) {
          attachmentsFolder.file("comment_attachments_info.txt", commentAttachmentsInfoText);
          console.log("تم إضافة معلومات مرفقات التعليقات، حجم المحتوى:", commentAttachmentsInfoText.length);
        }
        
        // If download_files option is selected
        if (shouldDownloadFiles) {
          const commentsFolder = zip.folder("comment_attachments");
          
          if (!commentsFolder) {
            console.warn("فشل إنشاء مجلد مرفقات التعليقات في الملف المضغوط");
          } else {
            console.log("تم إنشاء مجلد مرفقات التعليقات بنجاح");
            
            try {
              console.time("download-comment-attachments");
              await downloadCommentAttachments(commentsWithAttachments, commentsFolder);
              console.timeEnd("download-comment-attachments");
              console.log("تم تنزيل مرفقات التعليقات بنجاح");
            } catch (commentsError) {
              console.error("حدث خطأ أثناء تنزيل مرفقات التعليقات:", commentsError);
              
              // رسالة خطأ للمستخدم
              if (!zip.file("_download_errors.txt")) {
                zip.file("_download_errors.txt", 
                  `حدث خطأ أثناء تنزيل بعض مرفقات التعليقات:\n${commentsError instanceof Error ? commentsError.message : String(commentsError)}\n\n` +
                  "يحتوي الملف المضغوط على معلومات الفكرة والمناقشات والتصويتات، لكن قد تكون بعض مرفقات التعليقات مفقودة."
                );
              }
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
      
      // استخدام ضغط أقل لتجنب المشاكل
      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 3  // استخدام مستوى ضغط متوسط لتجنب المشاكل
        }
      });
      
      console.timeEnd("generate-zip-async");
      
      if (!zipBlob || zipBlob.size === 0) {
        throw new Error("فشل إنشاء ملف ZIP (الملف فارغ)");
      }
      
      console.log(`تم إنشاء ملف ZIP بنجاح. حجم الملف: ${zipBlob.size} بايت`);
      
      const fileName = sanitizeFileName(`فكرة-${ideaTitle}.zip`);
      console.log(`Saving ZIP file as: ${fileName}`);
      
      // حفظ الملف باستخدام FileSaver
      console.time("download-zip-file");
      saveAs(zipBlob, fileName);
      console.timeEnd("download-zip-file");
      console.log("تم تنزيل الملف المضغوط بنجاح");
      
    } catch (zipGenError) {
      console.error("خطأ أثناء إنشاء أو حفظ ملف ZIP:", zipGenError);
      throw new Error(`فشل توليد ملف ZIP: ${zipGenError instanceof Error ? zipGenError.message : String(zipGenError)}`);
    }
    
  } catch (error) {
    console.error("خطأ في إنشاء ملف ZIP:", error);
    throw new Error(`فشل إنشاء ملف ZIP: ${error instanceof Error ? error.message : String(error)}`);
  }
};
