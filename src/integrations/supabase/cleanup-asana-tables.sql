
-- Cleanup script to remove Asana-related tables and fields
-- This will be executed in Supabase SQL Editor

-- First, check if department_projects table exists (it contains asana_gid)
DO $$
BEGIN
  -- Drop department_projects table if it exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'department_projects') THEN
    DROP TABLE IF EXISTS public.department_projects;
    RAISE NOTICE 'Dropped department_projects table';
  END IF;

  -- Remove Asana-related columns from departments table
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'departments' AND column_name = 'asana_gid'
  ) THEN
    ALTER TABLE departments DROP COLUMN IF EXISTS asana_gid;
    ALTER TABLE departments DROP COLUMN IF EXISTS asana_folder_gid;
    ALTER TABLE departments DROP COLUMN IF EXISTS asana_sync_enabled;
    RAISE NOTICE 'Removed Asana columns from departments table';
  END IF;
  
  -- Remove Asana-related columns from portfolio_tasks
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'portfolio_tasks' AND column_name = 'asana_gid'
  ) THEN
    ALTER TABLE portfolio_tasks DROP COLUMN IF EXISTS asana_gid;
    RAISE NOTICE 'Removed asana_gid from portfolio_tasks table';
  END IF;
  
  -- Remove Asana-related columns from portfolio_task_comments
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'portfolio_task_comments' AND column_name = 'asana_gid'
  ) THEN
    ALTER TABLE portfolio_task_comments DROP COLUMN IF EXISTS asana_gid;
    RAISE NOTICE 'Removed asana_gid from portfolio_task_comments table';
  END IF;
  
  -- Remove Asana-related columns from portfolio_task_attachments
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'portfolio_task_attachments' AND column_name = 'asana_gid'
  ) THEN
    ALTER TABLE portfolio_task_attachments DROP COLUMN IF EXISTS asana_gid;
    RAISE NOTICE 'Removed asana_gid from portfolio_task_attachments table';
  END IF;
  
  -- Remove Asana-related columns from portfolio_subtasks
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'portfolio_subtasks' AND column_name = 'asana_gid'
  ) THEN
    ALTER TABLE portfolio_subtasks DROP COLUMN IF EXISTS asana_gid;
    RAISE NOTICE 'Removed asana_gid from portfolio_subtasks table';
  END IF;
  
  -- Remove Asana-related columns from portfolio_projects
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'portfolio_projects' AND column_name = 'asana_gid'
  ) THEN
    ALTER TABLE portfolio_projects DROP COLUMN IF EXISTS asana_gid;
    ALTER TABLE portfolio_projects DROP COLUMN IF EXISTS asana_workspace_id;
    ALTER TABLE portfolio_projects DROP COLUMN IF EXISTS asana_status;
    ALTER TABLE portfolio_projects DROP COLUMN IF EXISTS asana_priority;
    RAISE NOTICE 'Removed Asana columns from portfolio_projects table';
  END IF;
  
  -- Remove Asana-related columns from portfolio_only_projects
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'portfolio_only_projects' AND column_name = 'asana_gid'
  ) THEN
    ALTER TABLE portfolio_only_projects DROP COLUMN IF EXISTS asana_gid;
    RAISE NOTICE 'Removed asana_gid from portfolio_only_projects table';
  END IF;
  
  -- Remove Asana-related columns from tasks
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'asana_gid'
  ) THEN
    ALTER TABLE tasks DROP COLUMN IF EXISTS asana_gid;
    RAISE NOTICE 'Removed asana_gid from tasks table';
  END IF;
  
  -- Remove Asana-related columns from task_attachments
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'task_attachments' AND column_name = 'asana_gid'
  ) THEN
    ALTER TABLE task_attachments DROP COLUMN IF EXISTS asana_gid;
    RAISE NOTICE 'Removed asana_gid from task_attachments table';
  END IF;
  
  -- Remove Asana-related columns from task_comments
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'task_comments' AND column_name = 'asana_gid'
  ) THEN
    ALTER TABLE task_comments DROP COLUMN IF EXISTS asana_gid;
    RAISE NOTICE 'Removed asana_gid from task_comments table';
  END IF;
  
  -- Remove Asana-related columns from task_subtasks
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'task_subtasks' AND column_name = 'asana_gid'
  ) THEN
    ALTER TABLE task_subtasks DROP COLUMN IF EXISTS asana_gid;
    RAISE NOTICE 'Removed asana_gid from task_subtasks table';
  END IF;
  
  -- Remove Asana-related columns from project_tasks
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'project_tasks' AND column_name = 'asana_gid'
  ) THEN
    ALTER TABLE project_tasks DROP COLUMN IF EXISTS asana_gid;
    RAISE NOTICE 'Removed asana_gid from project_tasks table';
  END IF;
  
  -- Drop sync_status table if it exists (it's used for Asana sync)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sync_status') THEN
    DROP TABLE IF EXISTS public.sync_status;
    RAISE NOTICE 'Dropped sync_status table';
  END IF;
  
  -- Drop workspace_sync_status table if it exists (it's used for Asana workspace sync)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'workspace_sync_status') THEN
    DROP TABLE IF EXISTS public.workspace_sync_status;
    RAISE NOTICE 'Dropped workspace_sync_status table';
  END IF;
END
$$;

-- Output final message
SELECT 'Successfully removed Asana-related database tables and columns' as result;
