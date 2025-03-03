
import { useState } from "react";

export const useTasksState = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [projectStages, setProjectStages] = useState<{ id: string; name: string }[]>([]);

  const handleStagesChange = (stages: { id: string; name: string }[]) => {
    setProjectStages(stages);
  };

  return {
    activeTab,
    setActiveTab,
    isAddDialogOpen,
    setIsAddDialogOpen,
    projectStages,
    handleStagesChange
  };
};
