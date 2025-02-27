
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
      // 1. جلب بيانات الفكرة
      const { data: ideaData, error: ideaError } = await supabase
        .from("ideas")
        .select(`
          *,
          created_by_user:created_by(email)
        `)
        .eq("id", ideaId)
        .single();
        
      if (ideaError) throw ideaError;
      
      // 2. جلب التعليقات
      const { data: commentsData, error: commentsError } = await supabase
        .from("idea_comments")
        .select("*")
        .eq("idea_id", ideaId)
        .order("created_at", { ascending: true });
        
      if (commentsError) throw commentsError;
      
      // 3. جلب القرار (إن وجد)
      const { data: decisionData, error: decisionError } = await supabase
        .from("idea_decisions")
        .select(`
          *,
          decision_maker:created_by(email)
        `)
        .eq("idea_id", ideaId)
        .maybeSingle();
        
      if (decisionError) throw decisionError;
      
      // 4. جلب التصويتات
      const { data: votesData, error: votesError } = await supabase
        .from("idea_votes")
        .select("*")
        .eq("idea_id", ideaId);
        
      if (votesError) throw votesError;
      
      // إعداد ملف مضغوط
      const zip = new JSZip();
      
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
      
      // 7. إنشاء ملف للتصويتات
      let votesTextContent = "التصويتات:\n\n";
      const upVotes = votesData.filter(v => v.vote_type === 'up').length;
      const downVotes = votesData.filter(v => v.vote_type === 'down').length;
      
      votesTextContent += `إجمالي الأصوات: ${votesData.length}\n`;
      votesTextContent += `الأصوات المؤيدة: ${upVotes}\n`;
      votesTextContent += `الأصوات المعارضة: ${downVotes}\n`;
      
      zip.file("votes.txt", votesTextContent);
      
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
      }
      
      // 9. إنشاء مجلد للملفات المرفقة
      const attachmentsFolder = zip.folder("attachments");
      
      // 10. الملفات الداعمة للفكرة
      if (ideaData.supporting_files && ideaData.supporting_files.length > 0) {
        const supportingFilesInfoText = "الملفات الداعمة للفكرة:\n\n" + 
          ideaData.supporting_files.map((file, index) => 
            `${index + 1}. ${file.name}: ${file.file_path}`
          ).join("\n");
        
        attachmentsFolder.file("_supporting_files_info.txt", supportingFilesInfoText);
        
        for (const file of ideaData.supporting_files) {
          try {
            // تنزيل الملف من التخزين
            const { data: fileData, error: fileError } = await supabase.storage
              .from('idea-files')
              .download(getFileNameFromPath(file.file_path));
              
            if (fileError) {
              console.error("Error downloading file:", fileError);
              continue;
            }
            
            if (fileData) {
              attachmentsFolder.file(`supporting/${file.name}`, fileData);
            }
          } catch (fileErr) {
            console.error("Error processing file:", fileErr);
          }
        }
      }
      
      // 11. مرفقات التعليقات
      const commentsWithAttachments = commentsData.filter(comment => comment.attachment_url);
      
      if (commentsWithAttachments.length > 0) {
        const commentAttachmentsInfoText = "مرفقات التعليقات:\n\n" + 
          commentsWithAttachments.map((comment, index) => 
            `${index + 1}. ${comment.attachment_name || 'ملف مرفق'}: ${comment.attachment_url}`
          ).join("\n");
        
        attachmentsFolder.file("_comment_attachments_info.txt", commentAttachmentsInfoText);
        
        for (const comment of commentsWithAttachments) {
          try {
            if (!comment.attachment_url) continue;
            
            // تنزيل الملف من التخزين
            const fileName = getFileNameFromPath(comment.attachment_url);
            const { data: fileData, error: fileError } = await supabase.storage
              .from('attachments')
              .download(fileName);
              
            if (fileError) {
              console.error("Error downloading comment attachment:", fileError);
              continue;
            }
            
            if (fileData) {
              attachmentsFolder.file(`comments/${comment.attachment_name || fileName}`, fileData);
            }
          } catch (fileErr) {
            console.error("Error processing comment attachment:", fileErr);
          }
        }
      }
      
      // 12. إنشاء الملف المضغوط وتنزيله
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `فكرة-${sanitizeFileName(ideaTitle)}.zip`);
      
      toast.success("تم تحضير الملف المضغوط بنجاح");
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
      totalCost += itemCost;
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
      className="flex items-center gap-2"
      variant="outline"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      تنزيل الفكرة والمناقشات
    </Button>
  );
};
