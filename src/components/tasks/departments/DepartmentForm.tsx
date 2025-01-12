import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAsanaApi } from "@/hooks/useAsanaApi";
import { supabase } from "@/integrations/supabase/client";

interface DepartmentFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const DepartmentForm = ({ onSuccess, onClose }: DepartmentFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { getWorkspace, createFolder } = useAsanaApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("يرجى إدخال اسم الإدارة");
      return;
    }

    setIsLoading(true);

    try {
      console.log('Creating new department:', { name, description });
      
      // Get Asana workspace
      const workspaceResponse = await getWorkspace();
      console.log('Asana workspace response:', workspaceResponse);
      
      if (!workspaceResponse?.data?.data?.[0]?.gid) {
        throw new Error('لم يتم العثور على مساحة عمل صالحة في Asana');
      }

      const workspace = workspaceResponse.data.data[0];
      
      // Create folder in Asana
      const folderResponse = await createFolder(workspace.gid, name);
      console.log('Asana folder creation response:', folderResponse);
      
      if (!folderResponse?.data?.data?.gid) {
        throw new Error('فشل إنشاء المحفظة في Asana');
      }

      // Create department in database
      const { error: dbError } = await supabase
        .from('departments')
        .insert([
          { 
            name, 
            description,
            asana_folder_gid: folderResponse.data.data.gid
          }
        ]);

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('فشل إنشاء الإدارة في قاعدة البيانات');
      }

      toast.success("تم إنشاء الإدارة بنجاح");
      onSuccess();
      onClose();

    } catch (error) {
      console.error('Error creating department:', error);
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الإدارة");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">اسم الإدارة</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={isLoading || !name.trim()}>
        {isLoading ? "جاري الإنشاء..." : "إنشاء"}
      </Button>
    </form>
  );
};