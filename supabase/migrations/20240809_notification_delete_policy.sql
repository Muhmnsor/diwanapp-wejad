
-- Add delete policy to in_app_notifications table
CREATE POLICY "Enable users to delete their own notifications" 
ON "public"."in_app_notifications"
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);
