
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface ProjectStagesProps {
  projectId: string | undefined;
  onStagesChange: (stages: { id: string; name: string }[]) => void;
}

export const ProjectStages = ({ projectId, onStagesChange }: ProjectStagesProps) => {
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

  useEffect(() => {
    fetchStages();
  }, [projectId]);

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

  if (isLoading) {
    return <div className="text-center py-4">جاري تحميل مراحل المشروع...</div>;
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">مراحل المشروع</h3>
          {canManageStages() && !isAdding && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> إضافة مرحلة
            </Button>
          )}
        </div>
        
        {isAdding && canManageStages() && (
          <div className="flex gap-2 mb-4">
            <Input
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              placeholder="اسم المرحلة الجديدة"
              className="flex-grow"
            />
            <Button onClick={addStage}>إضافة</Button>
            <Button variant="outline" onClick={() => {
              setIsAdding(false);
              setNewStageName("");
            }}>إلغاء</Button>
          </div>
        )}
        
        {stages.length === 0 ? (
          <div className="text-center py-4 bg-gray-50 rounded-md">
            <p className="text-gray-500">لا توجد مراحل للمشروع. {canManageStages() ? 'أضف مرحلة جديدة للبدء.' : ''}</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 rtl">
            {stages.map((stage) => (
              <div key={stage.id} className="border rounded-md p-2 bg-gray-50 flex items-center justify-between">
                {editingStageId === stage.id ? (
                  <div className="flex gap-2">
                    <Input
                      value={editStageName}
                      onChange={(e) => setEditStageName(e.target.value)}
                      className="w-32 h-8"
                    />
                    <Button size="sm" className="h-8 px-2" onClick={saveEdit}>حفظ</Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 px-2"
                      onClick={() => setEditingStageId(null)}
                    >
                      إلغاء
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium px-2">{stage.name}</span>
                    {canManageStages() && (
                      <div className="flex gap-1 mr-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0"
                          onClick={() => startEdit(stage)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          onClick={() => deleteStage(stage.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
