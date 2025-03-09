
-- Create a storage bucket for request attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('request-attachments', 'Request Attachments', true);

-- Set up access policies for the request-attachments bucket
-- Allow public access to read files (since they're used in forms)
CREATE POLICY "Public Access" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'request-attachments');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'request-attachments' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own uploaded files
CREATE POLICY "Users can update own files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'request-attachments' 
  AND auth.uid() = owner
);

-- Allow users to delete their own uploaded files
CREATE POLICY "Users can delete own files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'request-attachments' 
  AND auth.uid() = owner
);
