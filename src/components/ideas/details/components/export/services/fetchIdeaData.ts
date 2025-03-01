
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch all data needed for idea export
 */
export const fetchIdeaData = async (ideaId: string, exportOptions: string[]) => {
  console.log("=== بدء جلب بيانات الفكرة للتصدير ===");
  console.log("معرف الفكرة:", ideaId);
  console.log("خيارات التصدير:", exportOptions);
  
  try {
    // Fetch idea data
    console.log("جلب بيانات الفكرة الأساسية...");
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', ideaId)
      .single();
    
    if (ideaError) {
      console.error("خطأ في جلب بيانات الفكرة:", ideaError);
      throw ideaError;
    }
    
    console.log("تم جلب بيانات الفكرة بنجاح، المعرف:", idea.id);
    console.log("حالة الفكرة:", idea.status);
    console.log("تاريخ الإنشاء:", new Date(idea.created_at).toLocaleString());
    
    // تسجيل معلومات الملفات الداعمة إن وجدت
    if (idea.supporting_files && Array.isArray(idea.supporting_files)) {
      console.log(`الفكرة تحتوي على ${idea.supporting_files.length} ملف داعم`);
      
      // سجل تفاصيل كل ملف
      idea.supporting_files.forEach((file: any, index: number) => {
        console.log(`ملف داعم #${index + 1}:`, {
          name: file.name,
          filePath: file.file_path,
          filePathType: typeof file.file_path,
          hasValidPath: !!file.file_path
        });
      });
    } else {
      console.log("الفكرة لا تحتوي على ملفات داعمة");
    }
    
    // فحص خيارات التصدير
    let commentsData = [];
    let votesData = [];
    let decisionData = null;
    
    // Fetch comments if requested
    if (exportOptions.includes("include_comments")) {
      console.log("جلب التعليقات...");
      const { data: comments, error: commentsError } = await supabase
        .from('idea_comments')
        .select('*')
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: false });
      
      if (commentsError) {
        console.error("خطأ في جلب التعليقات:", commentsError);
      } else {
        commentsData = comments;
        console.log(`تم جلب ${comments.length} تعليق بنجاح`);
        
        // تسجيل معلومات مرفقات التعليقات
        const commentsWithAttachments = comments.filter((comment: any) => comment.attachment_url);
        if (commentsWithAttachments.length > 0) {
          console.log(`يوجد ${commentsWithAttachments.length} تعليق بمرفقات`);
          
          // سجل تفاصيل كل مرفق
          commentsWithAttachments.forEach((comment: any, index: number) => {
            console.log(`مرفق تعليق #${index + 1}:`, {
              commentId: comment.id,
              attachmentName: comment.attachment_name || 'بدون اسم',
              attachmentUrl: comment.attachment_url,
              attachmentType: comment.attachment_type || 'غير معروف',
              isPDF: comment.attachment_type?.includes('pdf') || 
                     comment.attachment_url?.includes('.pdf') || 
                     (comment.attachment_name && comment.attachment_name.endsWith('.pdf'))
            });
          });
        } else {
          console.log("لا توجد تعليقات بمرفقات");
        }
      }
    }
    
    // Fetch votes if requested
    if (exportOptions.includes("include_votes")) {
      console.log("جلب الأصوات...");
      const { data: votes, error: votesError } = await supabase
        .from('idea_votes')
        .select('*')
        .eq('idea_id', ideaId);
      
      if (votesError) {
        console.error("خطأ في جلب الأصوات:", votesError);
      } else {
        votesData = votes;
        console.log(`تم جلب ${votes.length} صوت بنجاح`);
      }
    }
    
    // Fetch decision if requested
    if (exportOptions.includes("include_decision")) {
      console.log("جلب بيانات القرار...");
      const { data: decision, error: decisionError } = await supabase
        .from('idea_decisions')
        .select('*')
        .eq('idea_id', ideaId)
        .maybeSingle();
      
      if (decisionError) {
        console.error("خطأ في جلب القرار:", decisionError);
      } else if (decision) {
        decisionData = decision;
        console.log("تم جلب بيانات القرار بنجاح");
      } else {
        console.log("لا يوجد قرار للفكرة");
      }
    }
    
    // Return all data
    console.log("=== تم جلب جميع البيانات المطلوبة بنجاح ===");
    return {
      idea,
      comments: commentsData,
      votes: votesData,
      decision: decisionData
    };
    
  } catch (error) {
    console.error("خطأ في جلب بيانات الفكرة:", error);
    throw error;
  }
};
