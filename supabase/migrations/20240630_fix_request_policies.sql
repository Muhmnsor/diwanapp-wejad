
-- Step 1: Drop existing problematic policies on the requests table
DROP POLICY IF EXISTS "Users can view requests they created" ON requests;
DROP POLICY IF EXISTS "Approvers can view requests assigned to them" ON requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON requests;
DROP POLICY IF EXISTS "Users can create requests" ON requests;
DROP POLICY IF EXISTS "Users can update requests they created" ON requests;
DROP POLICY IF EXISTS "Approvers can update requests assigned to them" ON requests;
DROP POLICY IF EXISTS "Admins can update all requests" ON requests;

-- Step 2: Create a security definer function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin_user(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin_result boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = user_id
    AND r.name IN ('admin', 'app_admin')
  ) INTO is_admin_result;
  
  RETURN is_admin_result;
END;
$$;

-- Step 3: Create a security definer function to check if a user is an approver
CREATE OR REPLACE FUNCTION is_request_approver(step_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM workflow_steps
    WHERE id = step_id
    AND approver_id = user_id
  );
END;
$$;

-- Step 4: Create simplified policies using security definer functions
-- Policy for SELECT operation
CREATE POLICY "Users can view their requests and approvers can view assigned requests" 
ON requests 
FOR SELECT 
USING (
  requester_id = auth.uid() OR 
  is_request_approver(current_step_id, auth.uid()) OR
  is_admin_user(auth.uid())
);

-- Policy for INSERT operation
CREATE POLICY "Users can create their own requests" 
ON requests 
FOR INSERT 
WITH CHECK (
  requester_id = auth.uid()
);

-- Policy for UPDATE operation
CREATE POLICY "Users can update their requests and approvers can update assigned requests" 
ON requests 
FOR UPDATE 
USING (
  requester_id = auth.uid() OR 
  is_request_approver(current_step_id, auth.uid()) OR
  is_admin_user(auth.uid())
);
