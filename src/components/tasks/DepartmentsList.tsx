import { useQuery } from "@tanstack/react-query";
import { Plus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { DepartmentCard } from "./DepartmentCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAsanaApi } from "@/hooks/useAsanaApi";
import { toast } from "sonner";

export const DepartmentsList = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { getWorkspace, createFolder } = useAsanaApi();

  const { data: departments = [], refetch } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Creating new department:', { name, description });
      
      // Get Asana workspace
      const workspaceResponse = await getWorkspace();
      console.log('Asana workspace response:', workspaceResponse);
      
      if (!workspaceResponse?.data?.data) {
        throw new Error('No workspace data returned from Asana');
      }

      const workspace = workspaceResponse.data.data[0];
      if (!workspace?.gid) {
        throw new Error('Invalid workspace data from Asana');
      }
      
      // Create folder in Asana
      const folderResponse = await createFolder(workspace.gid, name);
      console.log('Asana folder creation response:', folderResponse);
      
      if (!folderResponse?.data?.data?.gid) {
        throw new Error('Failed to create folder in Asana');
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
        throw new Error('Failed to create department in database');
      }

      toast.success("تم إنشاء الإدارة بنجاح");
      setIsOpen(false);
      setName("");
      setDescription("");
      refetch();

    } catch (error) {
      console.error('Error creating department:', error);
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الإدارة");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة إدارة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة إدارة جديدة</DialogTitle>
            </DialogHeader>
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "جاري الإنشاء..." : "إنشاء"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {departments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">لا توجد إدارات</h3>
          <p className="mt-2 text-sm text-gray-500">قم بإضافة إدارة جديدة للبدء</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department) => (
            <DepartmentCard key={department.id} department={department} />
          ))}
        </div>
      )}
    </div>
  );
};