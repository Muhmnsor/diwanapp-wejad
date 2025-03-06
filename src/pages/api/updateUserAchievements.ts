
import { updateUserStats } from "@/components/tasks/reports/utils/achievementsCalculator";
import { supabase } from "@/integrations/supabase/client";

export async function runAchievementsUpdate() {
  try {
    // Get all active users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_active', true);
      
    if (usersError) {
      console.error("Error fetching users:", usersError);
      return { success: false, error: usersError.message };
    }
    
    // Update stats for each user
    const results = await Promise.allSettled(
      users.map(user => updateUserStats(user.id))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    return {
      success: true,
      message: `Updated stats for ${successful} users. Failed: ${failed}.`
    };
  } catch (error) {
    console.error("Error running achievements update:", error);
    return { success: false, error };
  }
}
