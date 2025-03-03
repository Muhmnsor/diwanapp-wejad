
import { StageItem } from "./StageItem";

interface StagesListProps {
  stages: { id: string; name: string }[];
  editingStageId: string | null;
  editStageName: string;
  setEditStageName: (name: string) => void;
  startEdit: (stage: { id: string; name: string }) => void;
  saveEdit: () => Promise<void>;
  deleteStage: (stageId: string) => Promise<void>;
  canManageStages: () => boolean;
  setEditingStageId: (id: string | null) => void;
}

export const StagesList = ({ 
  stages, 
  editingStageId, 
  editStageName, 
  setEditStageName,
  startEdit, 
  saveEdit, 
  deleteStage,
  canManageStages,
  setEditingStageId
}: StagesListProps) => {
  if (stages.length === 0) {
    return (
      <div className="text-center py-4 bg-gray-50 rounded-md">
        <p className="text-gray-500">لا توجد مراحل للمشروع. {canManageStages() ? 'أضف مرحلة جديدة للبدء.' : ''}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 rtl">
      {stages.map((stage) => (
        <StageItem
          key={stage.id}
          stage={stage}
          editingStageId={editingStageId}
          editStageName={editStageName}
          setEditStageName={setEditStageName}
          startEdit={startEdit}
          saveEdit={saveEdit}
          deleteStage={deleteStage}
          canManageStages={canManageStages}
          setEditingStageId={setEditingStageId}
        />
      ))}
    </div>
  );
};
