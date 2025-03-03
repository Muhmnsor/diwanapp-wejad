
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

interface UseProjectStagesProps {
  projectId: string | undefined;
  onStagesChange: (stages: { id: string; name: string }[]) => void;
}

export const useProjectStages = ({ projectId, onStagesChange }: UseProjectStagesProps) => {
  const [stages, setStages] = useState<{ id: string; name: string }[]>([]);
  const [newStageName, setNewStageName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editStageName, setEditStageName] = useState("");
  const { user } = useAuthStore();

  // Check if user is a workspace admin
  const canManageStages = () => {
    return user?.isAdmin || user?.role === 'admin';
  };

  const fetchStages = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_stages')
        .select('id, name')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      setStages(data || []);
      onStagesChange(data || []);
    } catch (error) {
      console.error("Error fetching stages:", error);
      toast.error("حدث خطأ أثناء تحميل مراحل المشروع");
    } finally {
      setIsLoading(false);
    }
  };

  const addStage = async () => {
    if (!projectId || !newStageName.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('project_stages')
        .insert([
          { name: newStageName, project_id: projectId }
        ])
        .select();
      
      if (error) throw error;
      
      setStages([...stages, data[0]]);
      onStagesChange([...stages, data[0]]);
      setNewStageName("");
      setIsAdding(false);
      toast.success("تم إضافة المرحلة بنجاح");
    } catch (error) {
      console.error("Error adding stage:", error);
      toast.error("حدث خطأ أثناء إضافة المرحلة");
    }
  };

  const startEdit = (stage: { id: string; name: string }) => {
    setEditingStageId(stage.id);
    setEditStageName(stage.name);
  };

  const saveEdit = async () => {
    if (!editingStageId || !editStageName.trim()) return;
    
    try {
      const { error } = await supabase
        .from('project_stages')
        .update({ name: editStageName })
        .eq('id', editingStageId);
      
      if (error) throw error;
      
      setStages(stages.map(stage => 
        stage.id === editingStageId ? { ...stage, name: editStageName } : stage
      ));
      onStagesChange(stages.map(stage => 
        stage.id === editingStageId ? { ...stage, name: editStageName } : stage
      ));
      setEditingStageId(null);
      toast.success("تم تحديث المرحلة بنجاح");
    } catch (error) {
      console.error("Error updating stage:", error);
      toast.error("حدث خطأ أثناء تحديث المرحلة");
    }
  };

  const deleteStage = async (stageId: string) => {
    try {
      // First check if there are tasks in this stage
      const { data: tasksCount, error: countError } = await supabase
        .from('tasks')
        .select('id', { count: 'exact' })
        .eq('stage_id', stageId);
      
      if (countError) throw countError;
      
      if ((tasksCount?.length || 0) > 0) {
        toast.error("لا يمكن حذف المرحلة لأنها تحتوي على مهام");
        return;
      }
      
      const { error } = await supabase
        .from('project_stages')
        .delete()
        .eq('id', stageId);
      
      if (error) throw error;
      
      const updatedStages = stages.filter(stage => stage.id !== stageId);
      setStages(updatedStages);
      onStagesChange(updatedStages);
      toast.success("تم حذف المرحلة بنجاح");
    } catch (error) {
      console.error("Error deleting stage:", error);
      toast.error("حدث خطأ أثناء حذف المرحلة");
    }
  };

  useEffect(() => {
    fetchStages();
  }, [projectId]);

  return {
    stages,
    newStageName,
    setNewStageName,
    isAdding,
    setIsAdding,
    isLoading,
    editingStageId,
    setEditingStageId,
    editStageName,
    setEditStageName,
    canManageStages,
    fetchStages,
    addStage,
    startEdit,
    saveEdit,
    deleteStage
  };
};
