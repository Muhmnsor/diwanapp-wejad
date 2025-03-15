
import { supabase } from '@/integrations/supabase/client';

export const upsertTasks = async (tasks: any[], workspaceId: string) => {
  if (!tasks?.length) {
    console.log('ℹ️ No tasks to sync');
    return;
  }

  console.log('📝 Updating tasks in database:', tasks.length, 'tasks');

  try {
    const { error: upsertError } = await supabase
      .from('portfolio_tasks')
      .upsert(tasks, { onConflict: 'id' });

    if (upsertError) {
      console.error('❌ Error upserting tasks:', upsertError);
      throw upsertError;
    }

    console.log('✅ Successfully updated tasks in database');
  } catch (error) {
    console.error('Error in upsertTasks:', error);
    throw error;
  }
};
