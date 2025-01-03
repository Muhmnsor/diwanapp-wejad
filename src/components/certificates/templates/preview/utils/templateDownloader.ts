import { supabase } from "@/integrations/supabase/client";

export const downloadTemplateFile = async (templatePath: string) => {
  try {
    console.log('📥 Downloading template file:', templatePath);
    const { data, error } = await supabase.storage
      .from('certificate-templates')
      .download(templatePath);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('❌ Error downloading template:', error);
    throw new Error('Failed to download template file');
  }
};