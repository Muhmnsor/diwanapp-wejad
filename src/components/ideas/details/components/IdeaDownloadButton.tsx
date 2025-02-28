
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
        .single();
        
      if (ideaError) {
        console.error("خطأ في جلب بيانات الفكرة:", ideaError);
        throw new Error(`فشل في جلب بيانات الفكرة: ${ideaError.message}`);
      }
      
      console.log("تم جلب بيانات الفكرة بنجاح:", ideaData);
      console.log("نوع المتغير supporting_files:", typeof ideaData.supporting_files);
      console.log("قيمة المتغير supporting_files:", JSON.stringify(ideaData.supporting_files));
      
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
      
      // إعداد ملف مضغوط
      console.log("5. جاري إنشاء ملف مضغوط...");
      let zip;
      try {
        zip = new JSZip();
        console.log("تم إنشاء كائن JSZip بنجاح");
      } catch (zipError) {
        console.error("خطأ في إنشاء كائن JSZip:", zipError);
        throw new Error(`فشل في تهيئة مكتبة الضغط: ${zipError.message}`);
      }
      
      // 6. إنشاء ملف نصي للفكرة
      console.log("6. جاري إنشاء ملف نصي للفكرة...");
      try {
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
        console.log("تم إنشاء محتوى ملف الفكرة النصي");
        zip.file("idea.txt", ideaTextContent);
        console.log("تمت إضافة idea.txt إلى الملف المضغوط");
      } catch (ideaFileError) {
        console.error("خطأ في إنشاء ملف الفكرة النصي:", ideaFileError);
        throw new Error(`فشل في إنشاء ملف الفكرة النصي: ${ideaFileError.message}`);
      }
      
      // 7. إنشاء ملف نصي للمناقشات
      console.log("7. جاري إنشاء ملف نصي للمناقشات...");
      try {
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
      } catch (commentsFileError) {
        console.error("خطأ في إنشاء ملف المناقشات النصي:", commentsFileError);
        throw new Error(`فشل في إنشاء ملف المناقشات النصي: ${commentsFileError.message}`);
      }
      
      // 8. إنشاء ملف للتصويتات
      console.log("8. جاري إنشاء ملف للتصويتات...");
      try {
        let votesTextContent = "التصويتات:\n\n";
        const upVotes = votesData.filter(v => v.vote_type === 'up').length;
        const downVotes = votesData.filter(v => v.vote_type === 'down').length;
        
        votesTextContent += `إجمالي الأصوات: ${votesData.length}\n`;
        votesTextContent += `الأصوات المؤيدة: ${upVotes}\n`;
        votesTextContent += `الأصوات المعارضة: ${downVotes}\n`;
        
        zip.file("votes.txt", votesTextContent);
        console.log("تمت إضافة votes.txt إلى الملف المضغوط");
      } catch (votesFileError) {
        console.error("خطأ في إنشاء ملف التصويتات النصي:", votesFileError);
        throw new Error(`فشل في إنشاء ملف التصويتات النصي: ${votesFileError.message}`);
      }
      
      // 9. إضافة القرار إذا كان موجودًا
      if (decisionData) {
        console.log("9. جاري إضافة ملف القرار...");
        try {
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
        } catch (decisionFileError) {
          console.error("خطأ في إنشاء ملف القرار النصي:", decisionFileError);
          throw new Error(`فشل في إنشاء ملف القرار النصي: ${decisionFileError.message}`);
        }
      }
      
      // 10. إنشاء مجلد للملفات المرفقة إذا كانت موجودة
      console.log("10. جاري إنشاء مجلد للملفات المرفقة...");
      const attachmentsFolder = zip.folder("attachments");
      if (!attachmentsFolder) {
        console.error("فشل في إنشاء مجلد المرفقات في الملف المضغوط");
        throw new Error("فشل في إنشاء مجلد المرفقات");
      }
      
      console.log("تم إنشاء مجلد المرفقات بنجاح");
      
      // 11. التحقق من وجود دلو التخزين (bucket) في Supabase للملفات الداعمة
      console.log("11. التحقق من دلو التخزين 'idea-files'...");
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.error("خطأ في جلب قائمة دلاء التخزين:", bucketsError);
      } else {
        console.log("دلاء التخزين المتوفرة:", buckets.map(b => b.name).join(", "));
        const ideaFilesBucketExists = buckets.some(b => b.name === 'idea-files');
        const attachmentsBucketExists = buckets.some(b => b.name === 'attachments');
        console.log("هل يوجد دلو idea-files؟", ideaFilesBucketExists ? "نعم" : "لا");
        console.log("هل يوجد دلو attachments؟", attachmentsBucketExists ? "نعم" : "لا");
      }
      
      // 12. الملفات الداعمة للفكرة (إذا كانت موجودة)
      console.log("12. معالجة الملفات الداعمة للفكرة...");
      let supportingFilesProcessed = 0;
      
      if (ideaData.supporting_files && Array.isArray(ideaData.supporting_files) && ideaData.supporting_files.length > 0) {
        console.log(`عدد الملفات الداعمة: ${ideaData.supporting_files.length}`);
        
        try {
          const supportingFilesInfoText = "الملفات الداعمة للفكرة:\n\n" + 
            ideaData.supporting_files.map((file, index) => 
              `${index + 1}. ${file.name}: ${file.file_path}`
            ).join("\n");
          
          attachmentsFolder.file("_supporting_files_info.txt", supportingFilesInfoText);
          console.log("تم إنشاء ملف معلومات الملفات الداعمة بنجاح");
          
          // إنشاء مجلد للملفات الداعمة
          const supportingFolder = attachmentsFolder.folder("supporting");
          if (!supportingFolder) {
            console.error("فشل في إنشاء مجلد الملفات الداعمة");
            throw new Error("فشل في إنشاء مجلد الملفات الداعمة");
          }
          
          console.log("تم إنشاء مجلد الملفات الداعمة بنجاح");
          
          // التحقق من محتويات دلو التخزين idea-files
          console.log("جاري التحقق من محتويات دلو idea-files...");
          const { data: bucketFiles, error: bucketFilesError } = await supabase.storage
            .from('idea-files')
            .list();
          
          if (bucketFilesError) {
            console.error("خطأ في جلب قائمة الملفات من دلو idea-files:", bucketFilesError);
          } else {
            console.log("الملفات الموجودة في دلو idea-files:", bucketFiles.map(f => f.name).join(", "));
          }
          
          // استخدام async/await في قائمة الوعود
          for (const file of ideaData.supporting_files) {
            try {
              console.log("معالجة الملف الداعم:", file.name, file.file_path);
              
              const fileName = getFileNameFromPath(file.file_path);
              console.log("اسم الملف المستخرج:", fileName);
              
              // تنزيل الملف من التخزين
              console.log(`محاولة تنزيل الملف ${fileName} من دلو idea-files...`);
              const { data: fileData, error: fileError } = await supabase.storage
                .from('idea-files')
                .download(fileName);
                
              if (fileError) {
                console.error(`خطأ في تنزيل الملف ${fileName}:`, fileError);
                continue;
              }
              
              if (!fileData) {
                console.error(`الملف ${fileName} غير موجود أو فارغ`);
                continue;
              }
              
              console.log(`تم تنزيل الملف ${fileName} بنجاح، حجم الملف: ${fileData.size} بايت`);
              
              // إضافة الملف إلى الملف المضغوط
              supportingFolder.file(file.name, fileData);
              supportingFilesProcessed++;
              console.log(`تمت إضافة الملف الداعم ${file.name} إلى الملف المضغوط`);
            } catch (fileErr) {
              console.error(`خطأ في معالجة الملف الداعم ${file.name}:`, fileErr);
            }
          }
        } catch (supportingFilesError) {
          console.error("خطأ في معالجة الملفات الداعمة:", supportingFilesError);
        }
      } else {
        console.log("لا توجد ملفات داعمة للمعالجة");
      }
      
      // 13. مرفقات التعليقات (إذا كانت موجودة)
      console.log("13. معالجة مرفقات التعليقات...");
      let attachmentsProcessed = 0;
      const commentsWithAttachments = commentsData.filter(comment => comment.attachment_url);
      
      if (commentsWithAttachments.length > 0) {
        console.log(`عدد التعليقات مع مرفقات: ${commentsWithAttachments.length}`);
        
        try {
          const commentAttachmentsInfoText = "مرفقات التعليقات:\n\n" + 
            commentsWithAttachments.map((comment, index) => 
              `${index + 1}. ${comment.attachment_name || 'ملف مرفق'}: ${comment.attachment_url}`
            ).join("\n");
          
          attachmentsFolder.file("_comment_attachments_info.txt", commentAttachmentsInfoText);
          console.log("تم إنشاء ملف معلومات مرفقات التعليقات بنجاح");
          
          // إنشاء مجلد لمرفقات التعليقات
          const commentsFolder = attachmentsFolder.folder("comments");
          if (!commentsFolder) {
            console.error("فشل في إنشاء مجلد مرفقات التعليقات");
            throw new Error("فشل في إنشاء مجلد مرفقات التعليقات");
          }
          
          console.log("تم إنشاء مجلد مرفقات التعليقات بنجاح");
          
          // التحقق من محتويات دلو التخزين attachments
          console.log("جاري التحقق من محتويات دلو attachments...");
          const { data: bucketFiles, error: bucketFilesError } = await supabase.storage
            .from('attachments')
            .list();
          
          if (bucketFilesError) {
            console.error("خطأ في جلب قائمة الملفات من دلو attachments:", bucketFilesError);
          } else {
            console.log("الملفات الموجودة في دلو attachments:", bucketFiles.map(f => f.name).join(", "));
          }
          
          // استخدام async/await في قائمة الوعود
          for (const comment of commentsWithAttachments) {
            try {
              if (!comment.attachment_url) {
                console.log("تخطي تعليق بدون رابط مرفق");
                continue;
              }
              
              console.log("معالجة مرفق التعليق:", comment.attachment_url);
              
              const fileName = getFileNameFromPath(comment.attachment_url);
              console.log("اسم الملف المستخرج:", fileName);
              
              // تنزيل الملف من التخزين
              console.log(`محاولة تنزيل الملف ${fileName} من دلو attachments...`);
              const { data: fileData, error: fileError } = await supabase.storage
                .from('attachments')
                .download(fileName);
                
              if (fileError) {
                console.error(`خطأ في تنزيل مرفق التعليق ${fileName}:`, fileError);
                continue;
              }
              
              if (!fileData) {
                console.error(`مرفق التعليق ${fileName} غير موجود أو فارغ`);
                continue;
              }
              
              console.log(`تم تنزيل مرفق التعليق ${fileName} بنجاح، حجم الملف: ${fileData.size} بايت`);
              
              // إضافة الملف إلى الملف المضغوط
              commentsFolder.file(comment.attachment_name || fileName, fileData);
              attachmentsProcessed++;
              console.log(`تمت إضافة مرفق التعليق ${comment.attachment_name || fileName} إلى الملف المضغوط`);
            } catch (fileErr) {
              console.error(`خطأ في معالجة مرفق التعليق:`, fileErr);
            }
          }
        } catch (attachmentsError) {
          console.error("خطأ في معالجة مرفقات التعليقات:", attachmentsError);
        }
      } else {
        console.log("لا توجد مرفقات تعليقات للمعالجة");
      }
      
      console.log(`تمت معالجة ${supportingFilesProcessed} ملف داعم و ${attachmentsProcessed} مرفق تعليق`);
      
      // 14. إنشاء الملف المضغوط وتنزيله
      console.log("14. جاري توليد الملف المضغوط النهائي...");
      try {
        const zipBlob = await zip.generateAsync({ type: "blob" });
        console.log("تم توليد الملف المضغوط، الحجم:", zipBlob.size, "بايت");
        
        if (zipBlob.size === 0) {
          console.error("الملف المضغوط فارغ (حجمه صفر بايت)");
          throw new Error("الملف المضغوط فارغ");
        }
        
        const sanitizedTitle = sanitizeFileName(ideaTitle || 'فكرة');
        const zipFileName = `فكرة-${sanitizedTitle}.zip`;
        console.log("جاري حفظ الملف المضغوط باسم:", zipFileName);
        
        try {
          saveAs(zipBlob, zipFileName);
          console.log("تم استدعاء وظيفة saveAs بنجاح");
        } catch (saveError) {
          console.error("خطأ في حفظ الملف:", saveError);
          throw new Error(`فشل في حفظ الملف المضغوط: ${saveError.message}`);
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
  
  const getFileNameFromPath = (path: string): string => {
    // استخراج اسم الملف من المسار الكامل
    if (!path) return '';
    
    console.log("استخراج اسم الملف من المسار:", path);
    
    // تجربة استخراج اسم الملف من URL كامل
    if (path.includes('https://')) {
      try {
        const url = new URL(path);
        const pathParts = url.pathname.split('/');
        const extractedName = pathParts[pathParts.length - 1];
        console.log("اسم الملف المستخرج من URL:", extractedName);
        return extractedName;
      } catch (e) {
        console.error("فشل في استخراج اسم الملف من URL:", e);
      }
    }
    
    // الطريقة البديلة: تقسيم المسار بناءً على '/'
    const parts = path.split('/');
    const extractedName = parts[parts.length - 1];
    console.log("اسم الملف المستخرج بالطريقة البديلة:", extractedName);
    return extractedName;
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
