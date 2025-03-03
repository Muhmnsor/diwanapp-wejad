
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { EditStageForm } from "./EditStageForm";

interface StageItemProps {
  stage: { id: string; name: string };
  editingStageId: string | null;
  editStageName: string;
  setEditStageName: (name: string) => void;
  startEdit: (stage: { id: string; name: string }) => void;
  saveEdit: () => Promise<void>;
  deleteStage: (stageId: string) => Promise<void>;
  canManageStages: () => boolean;
  setEditingStageId: (id: string | null) => void;
}

export const StageItem = ({ 
  stage, 
  editingStageId, 
  editStageName, 
  setEditStageName,
  startEdit, 
  saveEdit, 
  deleteStage,
  canManageStages,
  setEditingStageId
}: StageItemProps) => {
  return (
    <div className="border rounded-md p-2 bg-gray-50 flex items-center justify-between">
      {editingStageId === stage.id ? (
        <EditStageForm 
          editStageName={editStageName} 
          setEditStageName={setEditStageName}
          saveEdit={saveEdit}
          cancelEdit={() => setEditingStageId(null)}
        />
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
  );
};
