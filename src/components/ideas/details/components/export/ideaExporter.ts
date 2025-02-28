
import { saveAs } from "file-saver";
import { supabase } from "@/integrations/supabase/client";
import * as JSZip from "jszip";
import { toast } from "sonner";

interface ExportOptions {
  ideaId: string;
  ideaTitle: string;
  exportOptions: string[];
  exportFormat: string;
}

export const exportIdea = async ({
  ideaId,
  ideaTitle,
  exportOptions,
  exportFormat,
}: ExportOptions) => {
  try {
    console.log("=== بدء عملية التصدير ===");
    console.log("معرف الفكرة:", ideaId);
    console.log("عنوان الفكرة:", ideaTitle);
    console.log("خيارات التصدير:", exportOptions);
    console.log("تنسيق التصدير:", exportFormat);

    // جلب البيانات حسب الخيارات المحددة
    const data = await fetchIdeaData(ideaId, exportOptions);
    
    // تصدير البيانات حسب التنسيق المحدد
    if (exportFormat === "pdf") {
      await exportToPdf(data, ideaTitle);
    } else if (exportFormat === "text") {
      exportToText(data, ideaTitle);
    } else if (exportFormat === "zip") {
      await exportToZip(data, ideaTitle);
    } else {
      throw new Error("تنسيق التصدير غير مدعوم");
    }
    
    console.log("=== اكتملت عملية التصدير بنجاح ===");
  } catch (error) {
    console.error("خطأ في عملية التصدير:", error);
    throw error;
  }
};

// جلب بيانات الفكرة حسب الخيارات المحددة
const fetchIdeaData = async (ideaId: string, options: string[]) => {
  const data: any = {};
  
  // دائماً نجلب معلومات الفكرة الأساسية
  console.log("جلب معلومات الفكرة الأساسية...");
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
  
  data.idea = ideaData;
  
  // جلب التعليقات إذا كانت مطلوبة
  if (options.includes("comments")) {
    console.log("جلب التعليقات...");
    const { data: commentsData, error: commentsError } = await supabase
      .from("idea_comments")
      .select("*")
      .eq("idea_id", ideaId)
      .order("created_at", { ascending: true });
      
    if (commentsError) {
      console.error("خطأ في جلب التعليقات:", commentsError);
      throw new Error(`فشل في جلب التعليقات: ${commentsError.message}`);
    }
    
    data.comments = commentsData || [];
  }
  
  // جلب التصويتات إذا كانت مطلوبة
  if (options.includes("votes")) {
    console.log("جلب التصويتات...");
    const { data: votesData, error: votesError } = await supabase
      .from("idea_votes")
      .select("*")
      .eq("idea_id", ideaId);
      
    if (votesError) {
      console.error("خطأ في جلب التصويتات:", votesError);
      throw new Error(`فشل في جلب التصويتات: ${votesError.message}`);
    }
    
    data.votes = votesData || [];
  }
  
  // جلب القرار إذا كان مطلوباً
  if (options.includes("decision")) {
    console.log("جلب بيانات القرار...");
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
    
    data.decision = decisionData;
  }
  
  return data;
};

// تصدير البيانات كملف نصي
const exportToText = (data: any, ideaTitle: string) => {
  let content = generateTextContent(data);
  
  // إنشاء وتنزيل الملف النصي
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const fileName = sanitizeFileName(`فكرة-${ideaTitle}.txt`);
  saveAs(blob, fileName);
};

// تصدير البيانات كملف PDF
const exportToPdf = async (data: any, ideaTitle: string) => {
  // هذه وظيفة مستقبلية - حالياً نستخدم التصدير النصي
  toast.error("عذراً، التصدير بصيغة PDF غير متاح حالياً. جاري استخدام التصدير النصي بدلاً من ذلك.");
  exportToText(data, ideaTitle);
};

// تصدير البيانات كملف مضغوط
const exportToZip = async (data: any, ideaTitle: string) => {
  const zip = new JSZip();
  
  // إضافة ملف للفكرة
  zip.file("idea.txt", generateIdeaTextContent(data.idea));
  
  // إضافة ملف للتعليقات إذا كانت موجودة
  if (data.comments) {
    zip.file("comments.txt", generateCommentsTextContent(data.comments));
  }
  
  // إضافة ملف للتصويتات إذا كانت موجودة
  if (data.votes) {
    zip.file("votes.txt", generateVotesTextContent(data.votes));
  }
  
  // إضافة ملف للقرار إذا كان موجوداً
  if (data.decision) {
    zip.file("decision.txt", generateDecisionTextContent(data.decision));
  }
  
  // إضافة ملف للمعلومات حول المرفقات والملفات الداعمة
  const attachmentsFolder = zip.folder("attachments_info");
  
  // إضافة معلومات الملفات الداعمة
  if (data.idea.supporting_files && Array.isArray(data.idea.supporting_files) && data.idea.supporting_files.length > 0) {
    const supportingFilesInfoText = "الملفات الداعمة للفكرة (روابط فقط):\n\n" + 
      data.idea.supporting_files.map((file: any, index: number) => 
        `${index + 1}. ${file.name}: ${file.file_path}`
      ).join("\n");
    
    attachmentsFolder.file("supporting_files_info.txt", supportingFilesInfoText);
  }
  
  // إضافة معلومات مرفقات التعليقات
  if (data.comments) {
    const commentsWithAttachments = data.comments.filter((comment: any) => comment.attachment_url);
    if (commentsWithAttachments.length > 0) {
      const commentAttachmentsInfoText = "مرفقات التعليقات (روابط فقط):\n\n" + 
        commentsWithAttachments.map((comment: any, index: number) => 
          `${index + 1}. ${comment.attachment_name || 'ملف مرفق'}: ${comment.attachment_url}`
        ).join("\n");
      
      attachmentsFolder.file("comment_attachments_info.txt", commentAttachmentsInfoText);
    }
  }
  
  // إنشاء وتنزيل الملف المضغوط
  try {
    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 5
      }
    });
    
    const fileName = sanitizeFileName(`فكرة-${ideaTitle}.zip`);
    saveAs(zipBlob, fileName);
  } catch (error) {
    console.error("خطأ في إنشاء الملف المضغوط:", error);
    throw new Error(`فشل في إنشاء الملف المضغوط: ${error.message}`);
  }
};

// وظائف إنشاء المحتوى النصي
const generateTextContent = (data: any): string => {
  let content = "";
  
  // إضافة معلومات الفكرة
  content += generateIdeaTextContent(data.idea);
  
  // إضافة التعليقات
  if (data.comments) {
    content += "\n\n" + "=" .repeat(50) + "\n";
    content += generateCommentsTextContent(data.comments);
  }
  
  // إضافة التصويتات
  if (data.votes) {
    content += "\n\n" + "=" .repeat(50) + "\n";
    content += generateVotesTextContent(data.votes);
  }
  
  // إضافة القرار
  if (data.decision) {
    content += "\n\n" + "=" .repeat(50) + "\n";
    content += generateDecisionTextContent(data.decision);
  }
  
  return content;
};

const generateIdeaTextContent = (ideaData: any): string => {
  const ideaCreatedAt = new Date(ideaData.created_at).toLocaleString('ar');
  return `عنوان الفكرة: ${ideaData.title}
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
${formatCosts(ideaData.expected_costs)}`;
};

const generateCommentsTextContent = (comments: any[]): string => {
  let commentsText = "المناقشات:\n\n";
  
  if (comments && comments.length > 0) {
    comments.forEach((comment, index) => {
      const commentDate = new Date(comment.created_at).toLocaleString('ar');
      commentsText += `[${commentDate}] ${comment.user_email || 'مستخدم'}: ${comment.content}\n`;
      if (comment.attachment_url) {
        commentsText += `مرفق: ${comment.attachment_name || 'ملف مرفق'}\n`;
      }
      commentsText += "------------------------------\n";
    });
  } else {
    commentsText += "لا توجد مناقشات.";
  }
  
  return commentsText;
};

const generateVotesTextContent = (votes: any[]): string => {
  let votesText = "التصويتات:\n\n";
  const upVotes = votes.filter(v => v.vote_type === 'up').length;
  const downVotes = votes.filter(v => v.vote_type === 'down').length;
  
  votesText += `إجمالي الأصوات: ${votes.length}\n`;
  votesText += `الأصوات المؤيدة: ${upVotes}\n`;
  votesText += `الأصوات المعارضة: ${downVotes}\n`;
  
  return votesText;
};

const generateDecisionTextContent = (decision: any): string => {
  if (!decision) return "القرار: لا يوجد قرار بعد.";
  
  const decisionDate = new Date(decision.created_at).toLocaleString('ar');
  return `القرار:
تاريخ القرار: ${decisionDate}
متخذ القرار: ${decision.decision_maker?.email || 'غير معروف'}
الحالة: ${getStatusText(decision.status)}

سبب القرار / ملاحظات:
${decision.reason || 'لا توجد ملاحظات'}

${decision.status === 'approved' ? `
المكلف بالتنفيذ: ${decision.assignee || 'غير محدد'}
الإطار الزمني: ${decision.timeline || 'غير محدد'}
الميزانية المقترحة: ${decision.budget || 'غير محددة'}
` : ''}`;
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
  return fileName.replace(/[\\/:*?"<>|]/g, '_').substring(0, 50);
};
