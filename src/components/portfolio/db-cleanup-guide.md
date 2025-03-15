
# Database Cleanup Guide for Asana Integration Removal

This document provides instructions on how to clean up the database after removing Asana integration.

## Running the Cleanup Script

1. Navigate to your Supabase dashboard
2. Open the SQL Editor
3. Paste the contents of the `cleanup-asana-tables.sql` file
4. Execute the SQL script

## What the Script Does

The cleanup script performs the following operations:

1. Drops the `department_projects` table (used for Asana project linking)
2. Removes Asana-related columns from the `departments` table:
   - `asana_gid`
   - `asana_folder_gid`
   - `asana_sync_enabled`
3. Removes the `asana_gid` column from:
   - `portfolio_tasks`
   - `portfolio_task_comments`
   - `portfolio_task_attachments`
   - `portfolio_subtasks`
   - `portfolio_only_projects`
   - `tasks`
   - `task_attachments`
   - `task_comments`
   - `task_subtasks`
   - `project_tasks`
4. Removes additional Asana columns from `portfolio_projects`:
   - `asana_workspace_id`
   - `asana_status`
   - `asana_priority`
5. Drops the `sync_status` table (used for Asana sync)
6. Drops the `workspace_sync_status` table (used for Asana workspace sync)

## Verification

After running the script, you can verify that the Asana-related tables and columns have been removed by checking:

```sql
-- Check if any table still has a column with 'asana' in the name
SELECT table_name, column_name
FROM information_schema.columns
WHERE column_name LIKE '%asana%';

-- Check if the removed tables still exist
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('department_projects', 'sync_status', 'workspace_sync_status');
```

## Note

This cleanup is a one-time operation and cannot be undone. Make sure you have a database backup before running the script if you want to preserve the ability to restore the data.
