
import { Card, CardContent } from "@/components/ui/card";
import { useProjectStages } from "./hooks/useProjectStages";
import { StagesHeader } from "./components/stages/StagesHeader";
import { AddStageForm } from "./components/stages/AddStageForm";
import { StagesList } from "./components/stages/StagesList";

interface ProjectStagesProps {
  projectId: string | undefined;
  onStagesChange: (stages: { id: string; name: string }[]) => void;
}

export const ProjectStages = ({ projectId, onStagesChange }: ProjectStagesProps) => {
  const {
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
    addStage,
    startEdit,
    saveEdit,
    deleteStage
  } = useProjectStages({ projectId, onStagesChange });

  if (isLoading) {
    return <div className="text-center py-4">جاري تحميل مراحل المشروع...</div>;
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <StagesHeader 
          canManageStages={canManageStages} 
          isAdding={isAdding} 
          setIsAdding={setIsAdding} 
        />
        
        {isAdding && canManageStages() && (
          <AddStageForm 
            newStageName={newStageName}
            setNewStageName={setNewStageName}
            addStage={addStage}
            cancelAdding={() => {
              setIsAdding(false);
              setNewStageName("");
            }}
          />
        )}
        
        <StagesList 
          stages={stages}
          editingStageId={editingStageId}
          editStageName={editStageName}
          setEditStageName={setEditStageName}
          startEdit={startEdit}
          saveEdit={saveEdit}
          deleteStage={deleteStage}
          canManageStages={canManageStages}
          setEditingStageId={setEditingStageId}
        />
      </CardContent>
    </Card>
  );
};
