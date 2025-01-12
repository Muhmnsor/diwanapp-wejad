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
  const { createFolder } = useAsanaApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("يرجى إدخال اسم الإدارة");
      return;
    }

    setIsLoading(true);

    try {
      console.log('🏁 بدء إنشاء إدارة جديدة:', { name, description });
      
      // Create portfolio in Asana directly with fixed workspace ID
      console.log('🔄 جاري إنشاء محفظة في Asana...');
      const folderResponse = await createFolder('1209130949457034', name);
      console.log('✅ استجابة إنشاء المحفظة من Asana:', folderResponse);
      
      if (!folderResponse?.data?.data?.gid) {
        console.error('❌ خطأ: فشل إنشاء المحفظة في Asana', folderResponse);
        throw new Error('فشل إنشاء المحفظة في Asana');
      }

      const folderGid = folderResponse.data.data.gid;
      console.log('📂 تم إنشاء المحفظة بنجاح، المعرف:', folderGid);

      // Create department in database
      console.log('💾 جاري إنشاء الإدارة في قاعدة البيانات...');
      const { error: dbError } = await supabase
        .from('departments')
        .insert([
          { 
            name, 
            description,
            asana_folder_gid: folderGid
          }
        ]);

      if (dbError) {
        console.error('❌ خطأ في قاعدة البيانات:', dbError);
        throw new Error('فشل إنشاء الإدارة في قاعدة البيانات');
      }

      console.log('✨ تم إنشاء الإدارة بنجاح في كل من Asana وقاعدة البيانات');
      toast.success("تم إنشاء الإدارة بنجاح");
      onSuccess();
      onClose();

    } catch (error) {
      console.error('❌ خطأ في إنشاء الإدارة:', error);
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