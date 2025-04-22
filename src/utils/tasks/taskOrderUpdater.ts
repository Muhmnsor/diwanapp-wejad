// src/utils/tasks/taskOrderUpdater.ts

import { supabase } from '@/lib/supabase';

export const updateTaskOrder = async (taskId: string, newPosition: number) => {
  const { data, error } = await supabase
    .rpc('update_task_order', {
      task_id_param: taskId,
      new_position_param: newPosition
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

