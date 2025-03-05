import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// رفع ملف مرفق
export const uploadAttachment = async (file: File, category = 'creator') => {
  try {
    console.log("Uploading file:", file.name, "with category:", category);
    
    // إنشاء اسم فريد للملف
    const fileExt = file.name.split('.').pop();
    const uniqueId = Math.random().toString(36).substring(2, 11);
    const fileName = `${uniqueId}_${Date.now()}.${fileExt}`;
    
    // محاولة رفع الملف إلى حاوية التخزين
    console.log("Attempting to upload file to storage bucket: task-attachments");
    
    const { data, error } = await supabase.storage
      .from('task-attachments')
      .upload(fileName, file);
    
    if (error) {
      console.error("Storage upload error:", error);
      throw error;
    }
    
    // إنشاء الرابط العام للملف
    const publicURL = supabase.storage
      .from('task-attachments')
      .getPublicUrl(fileName).data.publicUrl;
    
    console.log("File uploaded successfully. Public URL:", publicURL);
    
    return {
      url: publicURL,
      name: file.name,
      type: file.type,
      category,
      error: null
    };
  } catch (error) {
    console.error("Error uploading attachment:", error);
    return {
      url: null,
      name: null,
      type: null,
      category,
      error
    };
  }
};

// حفظ مرجع المرفق في قاعدة البيانات
export const saveAttachmentReference = async (
  taskId: string, 
  fileUrl: string, 
  fileName: string, 
  fileType: string, 
  category = 'creator'
) => {
  try {
    console.log("Saving attachment reference for task:", taskId);
    console.log("File details:", { fileName, fileType, category });
    
    // الحصول على معرف المستخدم الحالي
    const { data: { user } } = await supabase.auth.getUser();
    
    // تحديد أي جدول يجب استخدامه
    const { data: tableExists } = await supabase.rpc('check_table_exists', {
      table_name: 'unified_task_attachments'
    });
    
    if (tableExists && tableExists.length > 0 && tableExists[0].table_exists) {
      console.log("Inserting into unified_task_attachments");
      const { data, error } = await supabase
        .from('unified_task_attachments')
        .insert({
          task_id: taskId,
          file_url: fileUrl,
          file_name: fileName,
          file_type: fileType,
          attachment_category: category,
          created_by: user?.id
        });
        
      if (error) {
        console.error("Error saving to unified_task_attachments:", error);
        throw error;
      }
      
      return data;
    } else {
      // تحديد ما إذا كان الملف مرتبط بمهمة عادية أو مهمة محفظة
      const { data: portfolioTask } = await supabase
        .from('portfolio_tasks')
        .select('id')
        .eq('id', taskId)
        .single();
      
      if (portfolioTask) {
        console.log("Inserting into portfolio_task_attachments");
        const { data, error } = await supabase
          .from('portfolio_task_attachments')
          .insert({
            task_id: taskId,
            file_url: fileUrl,
            file_name: fileName,
            file_type: fileType,
            attachment_category: category,
            created_by: user?.id
          });
          
        if (error) {
          console.error("Error saving to portfolio_task_attachments:", error);
          throw error;
        }
        
        return data;
      } else {
        console.log("Inserting into task_attachments");
        // محاولة حفظ المرفق في جدول المرفقات
        const { data, error } = await supabase
          .from('task_attachments')
          .insert({
            task_id: taskId,
            file_url: fileUrl,
            file_name: fileName,
            file_type: fileType,
            attachment_category: category,
            created_by: user?.id
          });
          
        if (error) {
          console.error("Error saving to task_attachments:", error);
          throw error;
        }
        
        return data;
      }
    }
  } catch (error) {
    console.error("Error saving attachment reference:", error);
    throw error;
  }
};

// جلب مرفقات المهمة
export const getTaskAttachments = async (taskId: string) => {
  try {
    // التحقق من وجود جدول unified_task_attachments
    const { data: tableExists } = await supabase.rpc('check_table_exists', {
      table_name: 'unified_task_attachments'
    });
    
    if (tableExists && tableExists.length > 0 && tableExists[0].table_exists) {
      // استخدام الجدول الموحد
      const { data, error } = await supabase
        .from('unified_task_attachments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    } else {
      // محاولة جلب المرفقات من جدول مرفقات المهام العادية
      const { data: taskAttachments, error: taskError } = await supabase
        .from('task_attachments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });
      
      if (taskError) {
        console.warn("Error fetching from task_attachments:", taskError);
      }
      
      // محاولة جلب المرفقات من جدول مرفقات المهام من المحفظة
      const { data: portfolioAttachments, error: portfolioError } = await supabase
        .from('portfolio_task_attachments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });
      
      if (portfolioError) {
        console.warn("Error fetching from portfolio_task_attachments:", portfolioError);
      }
      
      // جمع المرفقات من كلا المصدرين
      return [
        ...(taskAttachments || []),
        ...(portfolioAttachments || [])
      ];
    }
  } catch (error) {
    console.error("Error fetching task attachments:", error);
    throw error;
  }
};

// حذف مرفق
export const deleteAttachment = async (attachmentId: string) => {
  try {
    // التحقق من وجود جدول unified_task_attachments
    const { data: tableExists } = await supabase.rpc('check_table_exists', {
      table_name: 'unified_task_attachments'
    });
    
    if (tableExists && tableExists.length > 0 && tableExists[0].table_exists) {
      // محاولة العثور على المرفق في الجدول الموحد
      const { data: attachment } = await supabase
        .from('unified_task_attachments')
        .select('file_url')
        .eq('id', attachmentId)
        .single();
      
      if (attachment) {
        // حذف المرفق من الجدول الموحد
        const { error } = await supabase
          .from('unified_task_attachments')
          .delete()
          .eq('id', attachmentId);
          
        if (error) throw error;
        return true;
      }
    }
    
    // محاولة العثور على المرفق في جدول مرفقات المهام العادية
    const { data: taskAttachment } = await supabase
      .from('task_attachments')
      .select('file_url')
      .eq('id', attachmentId)
      .single();
    
    if (taskAttachment) {
      // حذف المرفق من جدول مرفقات المهام العادية
      const { error } = await supabase
        .from('task_attachments')
        .delete()
        .eq('id', attachmentId);
        
      if (error) throw error;
      return true;
    }
    
    // مح��ولة العثور على المرفق في جدول مرفقات المهام من المحفظة
    const { data: portfolioAttachment } = await supabase
      .from('portfolio_task_attachments')
      .select('file_url')
      .eq('id', attachmentId)
      .single();
    
    if (portfolioAttachment) {
      // حذف المرفق من جدول مرفقات المهام من المحفظة
      const { error } = await supabase
        .from('portfolio_task_attachments')
        .delete()
        .eq('id', attachmentId);
        
      if (error) throw error;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error deleting attachment:", error);
    throw error;
  }
};

// حفظ نموذج المهمة في قاعدة البيانات
export const saveTaskTemplate = async (
  taskId: string, 
  fileUrl: string, 
  fileName: string, 
  fileType: string
) => {
  try {
    console.log("Saving task template for task:", taskId);
    console.log("File details:", { fileName, fileType });
    
    // الحصول على معرف المستخدم الحالي
    const { data: { user } } = await supabase.auth.getUser();
    
    // تحديد نوع جدول المهمة
    let taskTable = 'tasks';
    
    // التحقق من وجود المهمة في جداول مختلفة لتحديد النوع المناسب
    const { data: portfolioTask } = await supabase
      .from('portfolio_tasks')
      .select('id')
      .eq('id', taskId)
      .single();
      
    if (portfolioTask) {
      taskTable = 'portfolio_tasks';
    } else {
      const { data: projectTask } = await supabase
        .from('project_tasks')
        .select('id')
        .eq('id', taskId)
        .single();
        
      if (projectTask) {
        taskTable = 'project_tasks';
      }
    }
    
    console.log("Using task table type for template:", taskTable);
    
    // حفظ النموذج في جدول نماذج المهمة
    const { data, error } = await supabase
      .from('task_templates')
      .insert({
        task_id: taskId,
        file_url: fileUrl,
        file_name: fileName,
        file_type: fileType,
        created_by: user?.id,
        task_table: taskTable
      });
      
    if (error) {
      console.error("Error saving to task_templates:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error saving task template:", error);
    throw error;
  }
};
