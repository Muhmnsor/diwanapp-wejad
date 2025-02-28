
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
    console.log("=== بدء عملية التنزيل ===");
    console.log("معرف الفكرة:", ideaId);
    console.log("عنوان الفكرة:", ideaTitle);

    try {
      // 1. جلب بيانات الفكرة
      console.log("1. جاري جلب بيانات الفكرة...");
      const { data: ideaData, error: ideaError } = await supabase
        .from("ideas")
        .select(`
          *,
          created_by_user:created_by(email)
        `)
        .eq("id", ideaId)
        .maybeSingle();
        
      if (ideaError) {
        console.error("خطأ في جلب بيانات الفكرة:", ideaError);
        throw new Error(`فشل في جلب بيانات الفكرة: ${ideaError.message}`);
      }
      
      if (!ideaData) {
        console.error("لم يتم العثور على بيانات للفكرة");
        throw new Error("لم يتم العثور على بيانات للفكرة");
      }
      
      console.log("تم جلب بيانات الفكرة بنجاح:", ideaData);
      
      // 2. جلب التعليقات
      console.log("2. جاري جلب التعليقات...");
      const { data: commentsData, error: commentsError } = await supabase
        .from("idea_comments")
        .select("*")
        .eq("idea_id", ideaId)
        .order("created_at", { ascending: true });
        
      if (commentsError) {
        console.error("خطأ في جلب التعليقات:", commentsError);
        throw new Error(`فشل في جلب التعليقات: ${commentsError.message}`);
      }
      
      console.log(`تم جلب ${commentsData?.length || 0} تعليق`);
      
      // 3. جلب القرار (إن وجد)
      console.log("3. جاري جلب بيانات القرار...");
      const { data: decisionData, error: decisionError } = await supabase
        .from("idea_decisions")
        .select(`
          *,
          decision_maker:created_by(email)
        `)
        .eq("idea_id", ideaId)
        .maybeSingle();
        
      if (decisionError) {
        console.error("خطأ في جلب القرار:", decisionError);
        throw new Error(`فشل في جلب بيانات القرار: ${decisionError.message}`);
      }
      
      console.log("تم جلب بيانات القرار:", decisionData ? "موجود" : "غير موجود");
      
      // 4. جلب التصويتات
      console.log("4. جاري جلب التصويتات...");
      const { data: votesData, error: votesError } = await supabase
        .from("idea_votes")
        .select("*")
        .eq("idea_id", ideaId);
        
      if (votesError) {
        console.error("خطأ في جلب التصويتات:", votesError);
        throw new Error(`فشل في جلب التصويتات: ${votesError.message}`);
      }
      
      console.log(`تم جلب ${votesData?.length || 0} تصويت`);
      
      // 5. إنشاء ملف زيب بدون محاولة تضمين الملفات المرفقة
      console.log("5. جاري إنشاء الملف المضغوط - بدون مرفقات...");
      const zip = new JSZip();
      
      // 6. إنشاء ملف نصي للفكرة
      console.log("6. جاري إنشاء ملف نصي للفكرة...");
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
      console.log("تمت إضافة idea.txt إلى الملف المضغوط");
      
      // 7. إنشاء ملف نصي للمناقشات
      console.log("7. جاري إنشاء ملف نصي للمناقشات...");
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
      console.log("تمت إضافة comments.txt إلى الملف المضغوط");
      
      // 8. إنشاء ملف للتصويتات
      console.log("8. جاري إنشاء ملف للتصويتات...");
      let votesTextContent = "التصويتات:\n\n";
      const upVotes = votesData.filter(v => v.vote_type === 'up').length;
      const downVotes = votesData.filter(v => v.vote_type === 'down').length;
      
      votesTextContent += `إجمالي الأصوات: ${votesData.length}\n`;
      votesTextContent += `الأصوات المؤيدة: ${upVotes}\n`;
      votesTextContent += `الأصوات المعارضة: ${downVotes}\n`;
      
      zip.file("votes.txt", votesTextContent);
      console.log("تمت إضافة votes.txt إلى الملف المضغوط");
      
      // 9. إضافة القرار إذا كان موجودًا
      if (decisionData) {
        console.log("9. جاري إضافة ملف القرار...");
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
        console.log("تمت إضافة decision.txt إلى الملف المضغوط");
      }
      
      // 10. إنشاء مجلد للملفات المرفقة (ملحوظة المعلومات فقط دون محاولة تنزيل الملفات الفعلية)
      const attachmentsFolder = zip.folder("attachments_info");
      
      // 11. إضافة معلومات الملفات الداعمة (إذا كانت موجودة)
      if (ideaData.supporting_files && Array.isArray(ideaData.supporting_files) && ideaData.supporting_files.length > 0) {
        console.log("11. جاري إضافة معلومات الملفات الداعمة...");
        const supportingFilesInfoText = "الملفات الداعمة للفكرة (ملاحظة: الملفات الفعلية غير مضمنة في هذا التنزيل):\n\n" + 
          ideaData.supporting_files.map((file, index) => 
            `${index + 1}. ${file.name}: ${file.file_path}`
          ).join("\n");
        
        attachmentsFolder.file("supporting_files_info.txt", supportingFilesInfoText);
        console.log("تمت إضافة معلومات الملفات الداعمة");
      }
      
      // 12. إضافة معلومات مرفقات التعليقات (إذا كانت موجودة)
      const commentsWithAttachments = commentsData.filter(comment => comment.attachment_url);
      if (commentsWithAttachments.length > 0) {
        console.log("12. جاري إضافة معلومات مرفقات التعليقات...");
        const commentAttachmentsInfoText = "مرفقات التعليقات (ملاحظة: الملفات الفعلية غير مضمنة في هذا التنزيل):\n\n" + 
          commentsWithAttachments.map((comment, index) => 
            `${index + 1}. ${comment.attachment_name || 'ملف مرفق'}: ${comment.attachment_url}`
          ).join("\n");
        
        attachmentsFolder.file("comment_attachments_info.txt", commentAttachmentsInfoText);
        console.log("تمت إضافة معلومات مرفقات التعليقات");
      }
      
      // 13. إنشاء الملف المضغوط وتنزيله
      console.log("13. جاري توليد الملف المضغوط النهائي...");
      try {
        const zipBlob = await zip.generateAsync({
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: {
            level: 5
          }
        });
        
        console.log("تم توليد الملف المضغوط، الحجم:", zipBlob.size, "بايت");
        
        if (zipBlob.size === 0) {
          console.error("الملف المضغوط فارغ (حجمه صفر بايت)");
          throw new Error("الملف المضغوط فارغ");
        }
        
        const sanitizedTitle = sanitizeFileName(ideaTitle || 'فكرة');
        const zipFileName = `فكرة-${sanitizedTitle}.zip`;
        console.log("جاري حفظ الملف المضغوط باسم:", zipFileName);
        
        // استخدام بديل لـ saveAs في حالة وجود مشكلة
        try {
          // الطريقة 1: استخدام saveAs من file-saver
          saveAs(zipBlob, zipFileName);
          console.log("تم استدعاء وظيفة saveAs بنجاح");
        } catch (saveError) {
          console.error("خطأ في استخدام saveAs:", saveError);
          
          // الطريقة 2: استخدام طريقة بديلة للتنزيل
          console.log("محاولة استخدام طريقة بديلة للتنزيل...");
          const downloadUrl = URL.createObjectURL(zipBlob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = zipFileName;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);
          }, 100);
          console.log("تم استخدام الطريقة البديلة للتنزيل");
        }
        
        toast.success("تم تحضير الملف المضغوط بنجاح");
        console.log("اكتملت عملية التنزيل بنجاح");
      } catch (zipError) {
        console.error("خطأ في إنشاء أو حفظ الملف المضغوط:", zipError);
        throw new Error(`فشل في إنشاء أو حفظ الملف المضغوط: ${zipError.message}`);
      }
    } catch (error) {
      console.error("=== حدث خطأ أثناء عملية التنزيل ===", error);
      toast.error(`حدث خطأ أثناء تحضير الملف المضغوط: ${error.message || "خطأ غير معروف"}`);
    } finally {
      setIsLoading(false);
      console.log("=== انتهت عملية التنزيل ===");
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
  
  const sanitizeFileName = (fileName: string): string => {
    const sanitized = fileName.replace(/[\\/:*?"<>|]/g, '_').substring(0, 50);
    console.log("اسم الملف قبل التنقية:", fileName);
    console.log("اسم الملف بعد التنقية:", sanitized);
    return sanitized;
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
