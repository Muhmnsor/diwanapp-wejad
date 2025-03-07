
-- ... keep existing code (table alterations)

-- Add a database function to handle task deletion with proper error handling and transaction support
CREATE OR REPLACE FUNCTION public.delete_task(p_task_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin BOOLEAN;
  is_assigned BOOLEAN;
  is_creator BOOLEAN;
  subtask_ids UUID[];
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = p_user_id
    AND r.name IN ('admin', 'app_admin')
  ) INTO is_admin;
  
  -- Check if user is assigned to the task
  SELECT EXISTS (
    SELECT 1 FROM tasks
    WHERE id = p_task_id
    AND assigned_to = p_user_id
  ) INTO is_assigned;
  
  -- Check if user created the task
  SELECT EXISTS (
    SELECT 1 FROM tasks
    WHERE id = p_task_id
    AND created_by = p_user_id
  ) INTO is_creator;
  
  -- Verify permissions
  IF NOT (is_admin OR is_assigned OR is_creator) THEN
    RAISE EXCEPTION 'Insufficient permissions to delete this task';
  END IF;
  
  -- Start transaction
  BEGIN
    -- Get all subtask IDs for this task
    SELECT array_agg(id) INTO subtask_ids
    FROM subtasks
    WHERE task_id = p_task_id;
    
    -- If there are subtasks, delete related records
    IF subtask_ids IS NOT NULL AND array_length(subtask_ids, 1) > 0 THEN
      -- 1. Delete subtask attachments
      DELETE FROM task_attachments
      WHERE task_id = ANY(subtask_ids) AND task_table = 'subtasks';
      
      -- 2. Delete subtask comments
      DELETE FROM unified_task_comments
      WHERE task_id = ANY(subtask_ids) AND task_table = 'subtasks';
      
      -- 3. Delete subtask discussion attachments
      DELETE FROM task_discussion_attachments
      WHERE task_id = ANY(subtask_ids) AND task_table = 'subtasks';
    END IF;
    
    -- 4. Delete all subtasks for this task
    DELETE FROM subtasks
    WHERE task_id = p_task_id;
    
    -- 5. Delete task discussion attachments
    DELETE FROM task_discussion_attachments
    WHERE task_id = p_task_id AND task_table = 'tasks';
    
    -- 6. Delete task templates
    DELETE FROM task_templates
    WHERE task_id = p_task_id;
    
    -- 7. Delete task attachments
    DELETE FROM task_attachments
    WHERE task_id = p_task_id;
    
    -- 8. Delete portfolio task attachments
    DELETE FROM portfolio_task_attachments
    WHERE task_id = p_task_id;
    
    -- 9. Delete task comments
    DELETE FROM task_comments
    WHERE task_id = p_task_id;
    
    -- 10. Delete unified task comments
    DELETE FROM unified_task_comments
    WHERE task_id = p_task_id AND task_table = 'tasks';
    
    -- 11. Delete task deliverables
    DELETE FROM task_deliverables
    WHERE task_id = p_task_id AND task_table = 'tasks';
    
    -- 12. Delete task history
    DELETE FROM task_history
    WHERE task_id = p_task_id;
    
    -- 13. Finally delete the task itself
    DELETE FROM tasks
    WHERE id = p_task_id;
    
    RETURN TRUE;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Error in delete_task: %', SQLERRM;
      RETURN FALSE;
  END;
END;
$$;

-- Add permission to call the function
GRANT EXECUTE ON FUNCTION public.delete_task TO authenticated;

