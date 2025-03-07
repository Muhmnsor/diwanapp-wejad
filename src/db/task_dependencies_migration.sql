
-- Update task_dependencies table to support all dependency types
ALTER TABLE public.task_dependencies 
ADD CONSTRAINT valid_dependency_type 
CHECK (dependency_type IN ('blocks', 'blocked_by', 'relates_to', 'finish-to-start', 'start-to-start', 'finish-to-finish'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_task_dependencies_task_id 
ON public.task_dependencies(task_id);

CREATE INDEX IF NOT EXISTS idx_task_dependencies_dependency_task_id 
ON public.task_dependencies(dependency_task_id);

CREATE INDEX IF NOT EXISTS idx_task_dependencies_dependency_type 
ON public.task_dependencies(dependency_type);
