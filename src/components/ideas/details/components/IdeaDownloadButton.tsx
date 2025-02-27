
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import * as JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "sonner";

interface IdeaDownloadButtonProps {
  ideaId: string;
  ideaTitle: string;
}

export const IdeaDownloadButton = ({ ideaId, ideaTitle }: IdeaDownloadButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      console.log("Starting download process for idea:", ideaId);
      
      // 1. جلب بيانات الفكرة
      const { data: ideaData, error: ideaError } = await supabase
        .from("ideas")
        .select(`
          *,
          created_by_user:created_by(email)
        `)
        .eq("id", ideaId)
        .single();
        
      if (ideaError) {
        console.error("Error fetching idea data:", ideaError);
        throw ideaError;
      }
      
      console.log("Idea data fetched successfully:", ideaData);
      
      // 2. جلب التعليقات
      const { data: commentsData, error: commentsError } = await supabase
        .from("idea_comments")
        .select("*")
        .eq("idea_id", ideaId)
        .order("created_at", { ascending: true });
        
      if (commentsError) {
        console.error("Error fetching comments:", commentsError);
        throw commentsError;
      }
      
      console.log(`Fetched ${commentsData?.length || 0} comments`);
      
      // 3. جلب القرار (إن وجد)
      const { data: decisionData, error: decisionError } = await supabase
        .from("idea_decisions")
        .select(`
          *,
          decision_maker:created_by(email)
        `)
        .eq("idea_id", ideaId)
        .maybeSingle();
        
      if (decisionError) {
        console.error("Error fetching decision:", decisionError);
        throw decisionError;
      }
      
      console.log("Decision data:", decisionData);
      
      // 4. جلب التصويتات
      const { data: votesData, error: votesError } = await supabase
        .from("idea_votes")
        .select("*")
        .eq("idea_id", ideaId);
        
      if (votesError) {
        console.error("Error fetching votes:", votesError);
        throw votesError;
      }
      
      console.log(`Fetched ${votesData?.length || 0} votes`);
      
      // إعداد ملف مضغوط
      const zip = new JSZip();
      console.log("Creating zip file...");
      
      // 5. إنشاء ملف نصي للفكرة
      const ideaCreatedAt = new Date(ideaData.created_at).toLocaleString('ar');
      const ideaTextContent = `عنوان الفكرة: ${ideaData.title}
تاريخ الإنشاء: ${ideaCreatedAt}
مقدم الفكرة: ${ideaData.created_by_user?.email || 'غير معروف'}
الحالة: ${getStatusText(ideaData.status)}
نوع الفكرة: ${ideaData.idea_type || 'غير محدد'}

الوصف:
${ideaData.description || 'لا يوجد وصف'}

المشكلة:
${ideaData.problem || 'غير محددة'}

الفرصة:
${ideaData.opportunity || 'غير محددة'}

الفوائد المتوقعة:
${ideaData.benefits || 'غير محددة'}

الموارد المطلوبة:
${ideaData.required_resources || 'غير محددة'}

فترة التنفيذ المقترحة: ${ideaData.duration || 'غير محددة'}
تاريخ التنفيذ المقترح: ${ideaData.proposed_execution_date ? new Date(ideaData.proposed_execution_date).toLocaleDateString('ar') : 'غير محدد'}

الإدارات المساهمة:
${formatDepartments(ideaData.contributing_departments)}

الشركاء المتوقعون:
${formatPartners(ideaData.expected_partners)}

التكاليف المتوقعة:
${formatCosts(ideaData.expected_costs)}
`;

      zip.file("idea.txt", ideaTextContent);
      console.log("Added idea.txt to zip");
      
      // 6. إنشاء ملف نصي للمناقشات
      let commentsTextContent = "المناقشات:\n\n";
      
      if (commentsData && commentsData.length > 0) {
        commentsData.forEach((comment, index) => {
          const commentDate = new Date(comment.created_at).toLocaleString('ar');
          commentsTextContent += `[${commentDate}] ${comment.user_email || 'مستخدم'}: ${comment.content}\n`;
          if (comment.attachment_url) {
            commentsTextContent += `مرفق: ${comment.attachment_name || 'ملف مرفق'}\n`;
          }
          commentsTextContent += "------------------------------\n";
        });
      } else {
        commentsTextContent += "لا توجد مناقشات.";
      }
      
      zip.file("comments.txt", commentsTextContent);
      console.log("Added comments.txt to zip");
      
      // 7. إنشاء ملف للتصويتات
      let votesTextContent = "التصويتات:\n\n";
      const upVotes = votesData.filter(v => v.vote_type === 'up').length;
      const downVotes = votesData.filter(v => v.vote_type === 'down').length;
      
      votesTextContent += `إجمالي الأصوات: ${votesData.length}\n`;
      votesTextContent += `الأصوات المؤيدة: ${upVotes}\n`;
      votesTextContent += `الأصوات المعارضة: ${downVotes}\n`;
      
      zip.file("votes.txt", votesTextContent);
      console.log("Added votes.txt to zip");
      
      // 8. إضافة القرار إذا كان موجودًا
      if (decisionData) {
        const decisionDate = new Date(decisionData.created_at).toLocaleString('ar');
        const decisionTextContent = `القرار:
تاريخ القرار: ${decisionDate}
متخذ القرار: ${decisionData.decision_maker?.email || 'غير معروف'}
الحالة: ${getStatusText(decisionData.status)}

سبب القرار / ملاحظات:
${decisionData.reason || 'لا توجد ملاحظات'}

${decisionData.status === 'approved' ? `
المكلف بالتنفيذ: ${decisionData.assignee || 'غير محدد'}
الإطار الزمني: ${decisionData.timeline || 'غير محدد'}
الميزانية المقترحة: ${decisionData.budget || 'غير محددة'}
` : ''}
`;
        zip.file("decision.txt", decisionTextContent);
        console.log("Added decision.txt to zip");
      }
      
      // 9. إنشاء مجلد للملفات المرفقة إذا كانت موجودة
      const attachmentsFolder = zip.folder("attachments");
      if (!attachmentsFolder) {
        console.error("Failed to create attachments folder in zip");
        throw new Error("فشل في إنشاء مجلد المرفقات");
      }
      
      // 10. الملفات الداعمة للفكرة (إذا كانت موجودة)
      let supportingFilesProcessed = 0;
      if (ideaData.supporting_files && ideaData.supporting_files.length > 0) {
        console.log("Processing supporting files:", ideaData.supporting_files.length);
        const supportingFilesInfoText = "الملفات الداعمة للفكرة:\n\n" + 
          ideaData.supporting_files.map((file, index) => 
            `${index + 1}. ${file.name}: ${file.file_path}`
          ).join("\n");
        
        attachmentsFolder.file("_supporting_files_info.txt", supportingFilesInfoText);
        
        // استخدام async/await في قائمة الوعود
        for (const file of ideaData.supporting_files) {
          try {
            console.log("Downloading supporting file:", file.name, file.file_path);
            const fileName = getFileNameFromPath(file.file_path);
            console.log("Extracted filename:", fileName);
            
            // تنزيل الملف من التخزين
            const { data: fileData, error: fileError } = await supabase.storage
              .from('idea-files')
              .download(fileName);
              
            if (fileError) {
              console.error("Error downloading file:", fileError);
              continue;
            }
            
            if (fileData) {
              attachmentsFolder.file(`supporting/${file.name}`, fileData);
              supportingFilesProcessed++;
              console.log("Added supporting file to zip:", file.name);
            }
          } catch (fileErr) {
            console.error("Error processing file:", fileErr);
          }
        }
      } else {
        console.log("No supporting files to process");
      }
      
      // 11. مرفقات التعليقات (إذا كانت موجودة)
      let attachmentsProcessed = 0;
      const commentsWithAttachments = commentsData.filter(comment => comment.attachment_url);
      
      if (commentsWithAttachments.length > 0) {
        console.log("Processing comment attachments:", commentsWithAttachments.length);
        const commentAttachmentsInfoText = "مرفقات التعليقات:\n\n" + 
          commentsWithAttachments.map((comment, index) => 
            `${index + 1}. ${comment.attachment_name || 'ملف مرفق'}: ${comment.attachment_url}`
          ).join("\n");
        
        attachmentsFolder.file("_comment_attachments_info.txt", commentAttachmentsInfoText);
        
        // استخدام async/await في قائمة الوعود
        for (const comment of commentsWithAttachments) {
          try {
            if (!comment.attachment_url) {
              console.log("Skipping comment with no attachment URL");
              continue;
            }
            
            console.log("Downloading comment attachment:", comment.attachment_url);
            const fileName = getFileNameFromPath(comment.attachment_url);
            console.log("Extracted filename:", fileName);
            
            // تنزيل الملف من التخزين
            const { data: fileData, error: fileError } = await supabase.storage
              .from('attachments')
              .download(fileName);
              
            if (fileError) {
              console.error("Error downloading comment attachment:", fileError);
              continue;
            }
            
            if (fileData) {
              attachmentsFolder.file(`comments/${comment.attachment_name || fileName}`, fileData);
              attachmentsProcessed++;
              console.log("Added comment attachment to zip:", comment.attachment_name || fileName);
            }
          } catch (fileErr) {
            console.error("Error processing comment attachment:", fileErr);
          }
        }
      } else {
        console.log("No comment attachments to process");
      }
      
      console.log(`Processed ${supportingFilesProcessed} supporting files and ${attachmentsProcessed} comment attachments`);
      
      // 12. إنشاء الملف المضغوط وتنزيله
      console.log("Generating final zip file...");
      const zipBlob = await zip.generateAsync({ type: "blob" });
      console.log("Zip file generated, size:", zipBlob.size);
      
      const sanitizedTitle = sanitizeFileName(ideaTitle || 'فكرة');
      const zipFileName = `فكرة-${sanitizedTitle}.zip`;
      console.log("Saving zip file as:", zipFileName);
      
      saveAs(zipBlob, zipFileName);
      
      toast.success("تم تحضير الملف المضغوط بنجاح");
      console.log("Download process completed successfully");
    } catch (error) {
      console.error("Error preparing zip file:", error);
      toast.error("حدث خطأ أثناء تحضير الملف المضغوط");
    } finally {
      setIsLoading(false);
    }
  };
  
  // وظائف مساعدة
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'draft': return 'مسودة';
      case 'under_review': return 'قيد المراجعة';
      case 'pending_decision': return 'بانتظار القرار';
      case 'approved': return 'تمت الموافقة';
      case 'rejected': return 'مرفوضة';
      case 'needs_modification': return 'تحتاج تعديل';
      default: return status || 'غير معروف';
    }
  };
  
  const formatDepartments = (departments: any[]): string => {
    if (!departments || !departments.length) return 'لا توجد إدارات مساهمة';
    
    return departments.map((dept: any, index: number) => {
      let name, contribution;
      if (typeof dept === 'string') {
        try {
          const parsed = JSON.parse(dept);
          name = parsed.name;
          contribution = parsed.contribution;
        } catch (e) {
          name = dept;
          contribution = '';
        }
      } else {
        name = dept.name;
        contribution = dept.contribution;
      }
      
      return `${index + 1}. ${name}${contribution ? ` - المساهمة: ${contribution}` : ''}`;
    }).join('\n');
  };
  
  const formatPartners = (partners: any[]): string => {
    if (!partners || !partners.length) return 'لا يوجد شركاء متوقعون';
    
    return partners.map((partner: any, index: number) => {
      return `${index + 1}. ${partner.name}${partner.contribution ? ` - المساهمة: ${partner.contribution}` : ''}`;
    }).join('\n');
  };
  
  const formatCosts = (costs: any[]): string => {
    if (!costs || !costs.length) return 'لا توجد تكاليف متوقعة';
    
    let totalCost = 0;
    const costsText = costs.map((cost: any, index: number) => {
      const itemCost = cost.total_cost || 0;
      totalCost += Number(itemCost);
      return `${index + 1}. ${cost.item} - الكمية: ${cost.quantity} - التكلفة: ${itemCost} ريال`;
    }).join('\n');
    
    return `${costsText}\n\nالتكلفة الإجمالية: ${totalCost} ريال`;
  };
  
  const getFileNameFromPath = (path: string): string => {
    // استخراج اسم الملف من المسار الكامل
    if (!path) return '';
    const parts = path.split('/');
    return parts[parts.length - 1];
  };
  
  const sanitizeFileName = (fileName: string): string => {
    return fileName.replace(/[\\/:*?"<>|]/g, '_').substring(0, 50);
  };
  
  return (
    <Button
      onClick={handleDownload}
      disabled={isLoading}
      size="sm"
      variant="outline" 
      className="text-xs flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
    >
      {isLoading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <FileDown size={14} />
      )}
      تنزيل الفكرة والمناقشات
    </Button>
  );
};
