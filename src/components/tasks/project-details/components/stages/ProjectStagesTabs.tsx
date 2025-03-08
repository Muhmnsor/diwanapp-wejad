
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ProjectStage } from "../../types/projectStage";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

interface ProjectStagesTabsProps {
  projectId: string;
  activeStageId: string;
  onStageChange: (stageId: string) => void;
}

export const ProjectStagesTabs = ({
  projectId,
  activeStageId,
  onStageChange,
}: ProjectStagesTabsProps) => {
  const [stages, setStages] = useState<ProjectStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStages = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("project_stages")
          .select("*")
          .eq("project_id", projectId)
          .order("order", { ascending: true });

        if (error) throw error;
        setStages(data || []);

        // If there are stages but no active stage, set the first one as active
        if (data && data.length > 0 && !activeStageId) {
          onStageChange(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching project stages:", error);
        toast.error("فشل في تحميل مراحل المشروع");
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchStages();
    }
  }, [projectId, activeStageId, onStageChange]);

  if (isLoading) {
    return <div className="h-10 bg-gray-100 animate-pulse rounded"></div>;
  }

  if (stages.length === 0) {
    return (
      <div className="text-center py-2">
        <p className="text-sm text-gray-500">لا توجد مراحل للمشروع</p>
      </div>
    );
  }

  return (
    <Tabs value={activeStageId} onValueChange={onStageChange}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">مراحل المشروع</h3>
        <Button size="sm" variant="ghost" className="h-8 px-2">
          <PlusCircle className="h-4 w-4 mr-1" />
          <span className="text-xs">إضافة مرحلة</span>
        </Button>
      </div>
      
      <TabsList className="w-full">
        {stages.map((stage) => (
          <TabsTrigger key={stage.id} value={stage.id} className="flex-1">
            {stage.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
