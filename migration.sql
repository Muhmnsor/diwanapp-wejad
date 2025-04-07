
-- Create the mail-attachments bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('mail-attachments', 'Mail Attachments', false);

-- Create policies for authenticated users to manage their own files

-- Policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload mail attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'mail-attachments');

-- Policy to allow authenticated users to view files
CREATE POLICY "Allow authenticated users to view mail attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'mail-attachments');

-- Policy to allow authenticated users to update their own files
CREATE POLICY "Allow authenticated users to update their own mail attachments"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'mail-attachments' AND auth.uid() = owner);

-- Policy to allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated users to delete their own mail attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'mail-attachments' AND auth.uid() = owner);
