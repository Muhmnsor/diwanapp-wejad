import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../types/task";
import { toast } from "sonner";

export const useTasksList = (
  projectId?: string, 
  meetingId?: string,
  isWorkspace = false
) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [projectStages, setProjectStages] = useState<{ id: string; name: string }[]>([]);
  const [tasksByStage, setTasksByStage] = useState<Record<string, Task[]>>({});
  
  // تحديد ما إذا كانت هذه مهام عامة (بدون معرف مشروع)
  const isGeneral = !projectId && !meetingId && !isWorkspace;
  
  // جلب المهام
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log(`جلب المهام: projectId=${projectId}, meetingId=${meetingId}, isWorkspace=${isWorkspace}, isGeneral=${isGeneral}`);
      
      // استعلام محسّن مع ربط جدول المستخدمين للحصول على معلومات المكلف
      let query = supabase
        .from('tasks')
        .select(`
          *,
          profiles:assigned_to (display_name, email),
          stage:stage_id (name)
        `);
      
      // تطبيق التصفية المناسبة بناءً على المعلمات المقدمة
      if (isWorkspace && projectId) {
        // حالة 1: مهام مساحة العمل
        console.log("جلب مهام مساحة العمل لمعرف:", projectId);
        query = query.eq('workspace_id', projectId);
      } else if (meetingId) {
        // حالة 2: مهام الاجتماع
        console.log("جلب مهام الاجتماع لمعرف:", meetingId);
        query = query.eq('meeting_id', meetingId);
      } else if (projectId && !isGeneral && !isWorkspace) {
        // حالة 3: مهام المشروع
        console.log("جلب مهام المشروع لمعرف:", projectId);
        query = query.eq('project_id', projectId);
      } else {
        // حالة 4: المهام العامة
        console.log("جلب المهام العامة");
        query = query.eq('is_general', true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error("خطأ في جلب المهام:", error);
        throw error;
      }
      
      console.log("البيانات الخام للمهام:", data);
      
      // تحويل البيانات وإضافة معلومات المستخدم المكلف
      const transformedTasks = data.map(task => {
        console.log("معالجة المهمة:", task.id, task.title);
        console.log("معلومات المكلف:", task.assigned_to, task.profiles);
        
        // استخراج اسم المستخدم المكلف بشكل آمن
        let assignedUserName = '';
        if (task.profiles) {
          // إذا كانت المعلومات في كائن مباشر (الحالة الأكثر شيوعًا)
          assignedUserName = task.profiles.display_name || task.profiles.email || '';
          console.log("اسم المكلف المستخرج من الكائن:", assignedUserName);
        }
        
        // استخراج اسم المرحلة بشكل آمن
        let stageName = '';
        if (task.stage) {
          stageName = task.stage.name || '';
        }
        
        return {
          ...task,
          assigned_user_name: assignedUserName,
          stage_name: stageName
        };
      });
      
      console.log("المهام المحولة مع أسماء المكلفين:", transformedTasks);
      
      setTasks(transformedTasks);
      
      // تجميع المهام حسب المرحلة لمهام المشروع التي لها مراحل
      if (projectId && !isWorkspace && !meetingId) {
        const groupedTasks: Record<string, Task[]> = {};
        transformedTasks.forEach(task => {
          if (task.stage_id) {
            if (!groupedTasks[task.stage_id]) {
              groupedTasks[task.stage_id] = [];
            }
            groupedTasks[task.stage_id].push(task);
          }
        });
        setTasksByStage(groupedTasks);
      }
      
      return transformedTasks;
    } catch (error) {
      console.error("خطأ في fetchTasks:", error);
      toast.error("حدث خطأ أثناء تحميل المهام");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [projectId, meetingId, isWorkspace, isGeneral]);
  
  // جلب مراحل المشروع إذا كان هذا عرض مشروع
  const fetchProjectStages = useCallback(async () => {
    if (isGeneral || isWorkspace || !projectId || meetingId) {
      setProjectStages([]);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('project_stages')
        .select('*')
        .eq('project_id', projectId);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setProjectStages(data.map(stage => ({
          id: stage.id,
          name: stage.name
        })));
      } else {
        // إنشاء مراحل افتراضية إذا لم تكن موجودة
        const defaultStages = [
          { name: "تخطيط", color: "blue" },
          { name: "تنفيذ", color: "amber" },
          { name: "مراجعة", color: "purple" },
          { name: "اكتمال", color: "green" }
        ];
        
        for (const stage of defaultStages) {
          await supabase.from('project_stages').insert({
            project_id: projectId,
            name: stage.name,
            color: stage.color
          });
        }
        
        // جلب المراحل مرة أخرى
        const { data: newData } = await supabase
          .from('project_stages')
          .select('*')
          .eq('project_id', projectId);
          
        if (newData) {
          setProjectStages(newData.map(stage => ({
            id: stage.id,
            name: stage.name
          })));
        }
      }
    } catch (error) {
      console.error("خطأ في جلب مراحل المشروع:", error);
    }
  }, [projectId, isGeneral, isWorkspace, meetingId]);
  
  // تجميع المهام حسب المرحلة
  useEffect(() => {
    const groupTasksByStage = () => {
      const grouped: Record<string, Task[]> = {};
      
      // تهيئة مصفوفات فارغة لجميع المراحل
      projectStages.forEach(stage => {
        grouped[stage.id] = [];
      });
      
      // إضافة المهام إلى مراحلها المناسبة
      tasks.forEach(task => {
        if (task.stage_id && grouped[task.stage_id]) {
          grouped[task.stage_id].push(task);
        } else if (projectStages.length > 0) {
          // إذا لم يكن للمهمة مرحلة، أضفها إلى المرحلة الأولى
          const firstStageId = projectStages[0].id;
          grouped[firstStageId] = [...(grouped[firstStageId] || []), task];
        }
      });
      
      setTasksByStage(grouped);
    };
    
    if (!isGeneral && !isWorkspace && projectId && !meetingId) {
      groupTasksByStage();
    }
  }, [tasks, projectStages, isGeneral, isWorkspace, projectId, meetingId]);
  
  // تحميل البيانات عند التثبيت وعند تغيير معرف المشروع
  useEffect(() => {
    fetchTasks();
    fetchProjectStages();
  }, [fetchTasks, fetchProjectStages]);
  
  // تصفية المهام بناءً على علامة التبويب النشطة
  useEffect(() => {
    if (activeTab === "all") {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter(task => task.status === activeTab));
    }
  }, [tasks, activeTab]);
  
  // التعامل مع تغييرات المراحل
  const handleStagesChange = () => {
    fetchProjectStages();
  };
  
  // التعامل مع تغيير الحالة
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // تحديث الحالة المحلية
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId 
            ? { ...task, status: newStatus } 
            : task
        )
      );
      
      toast.success("تم تحديث حالة المهمة");
    } catch (error) {
      console.error("خطأ في تحديث حالة المهمة:", error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
    }
  };
  
  // حذف مهمة
  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) throw error;
      
      // تحديث الحالة المحلية
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      toast.success("تم حذف المهمة بنجاح");
    } catch (error) {
      console.error("خطأ في حذف المهمة:", error);
      toast.error("حدث خطأ أثناء حذف المهمة");
      throw error;
    }
  };
  
  return {
    tasks,
    filteredTasks,
    isLoading,
    activeTab,
    setActiveTab,
    isAddDialogOpen,
    setIsAddDialogOpen,
    projectStages,
    handleStagesChange,
    tasksByStage,
    handleStatusChange,
    fetchTasks,
    isGeneral,
    deleteTask
  };
};
