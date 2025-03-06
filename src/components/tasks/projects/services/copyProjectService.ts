
import { supabase } from "@/integrations/supabase/client";

export const copyProjectStages = async (originalProjectId: string, newProjectId: string) => {
  try {
    const { data: originalStages, error: stagesError } = await supabase
      .from("project_stages")
      .select("*")
      .eq("project_id", originalProjectId);
      
    if (stagesError) throw new Error("فشل في جلب مراحل المشروع الأصلي");
    
    if (originalStages?.length > 0) {
      const newStages = originalStages.map(stage => ({
        name: stage.name,
        project_id: newProjectId,
        color: stage.color || '#60A5FA'
      }));
      
      const { error: insertStagesError } = await supabase
        .from("project_stages")
        .insert(newStages);
        
      if (insertStagesError) {
        throw new Error("فشل في نسخ مراحل المشروع");
      }
    }
    
    return originalStages?.length || 0;
  } catch (error) {
    console.error("Error in copyProjectStages:", error);
    throw error;
  }
};

export const createStageMapping = async (originalProjectId: string, newProjectId: string): Promise<Record<string, string>> => {
  try {
    const { data: originalStageIds } = await supabase
      .from("project_stages")
      .select("id, name")
      .eq("project_id", originalProjectId);
      
    const { data: newStageIds } = await supabase
      .from("project_stages")
      .select("id, name")
      .eq("project_id", newProjectId);
      
    const stageMapping: Record<string, string> = {};
    
    if (originalStageIds && newStageIds) {
      originalStageIds.forEach(oldStage => {
        const matchingNewStage = newStageIds.find(s => s.name === oldStage.name);
        if (matchingNewStage) {
          stageMapping[oldStage.id] = matchingNewStage.id;
        }
      });
    }
    
    return stageMapping;
  } catch (error) {
    console.error("Error creating stage mapping:", error);
    return {};
  }
};
