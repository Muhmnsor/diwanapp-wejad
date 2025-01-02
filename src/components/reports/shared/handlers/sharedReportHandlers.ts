import { BaseReport } from "@/types/sharedReport";
import { supabase } from "@/integrations/supabase/client";

export const deleteReport = async (tableName: string, reportId: string) => {
  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', reportId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting ${tableName} report:`, error);
    return false;
  }
};

export const updateReport = async (
  tableName: string,
  reportId: string,
  data: Partial<BaseReport>
) => {
  try {
    const { error } = await supabase
      .from(tableName)
      .update(data)
      .eq('id', reportId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error updating ${tableName} report:`, error);
    return false;
  }
};