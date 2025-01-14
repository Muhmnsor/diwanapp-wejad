import { supabase } from '@/integrations/supabase/client';
import { transformAsanaTasks } from '../utils/taskTransformers';

export const upsertTasks = async (syncedTasks: any, workspaceId: string) => {
  if (!syncedTasks?.tasks?.length) {
    console.log('ℹ️ No tasks to sync');
    return;
  }

  console.log('📝 Updating tasks in database:', syncedTasks.tasks.length, 'tasks');
  const transformedTasks = transformAsanaTasks(syncedTasks.tasks, workspaceId);

  const { error: upsertError } = await supabase
    .from('portfolio_tasks')
    .upsert(transformedTasks, { onConflict: 'asana_gid' });

  if (upsertError) {
    console.error('❌ Error upserting tasks:', upsertError);
    throw upsertError;
  }

  console.log('✅ Successfully updated tasks in database');
};