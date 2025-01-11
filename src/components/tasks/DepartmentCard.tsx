import { useState } from "react";
import { Department } from "@/types/department";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Building2, Plus } from "lucide-react";
import { ProjectsList } from "./ProjectsList";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface DepartmentCardProps {
  department: Department;
}

export const DepartmentCard = ({ department }: DepartmentCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First create the project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert([{
          title: projectTitle,
          description: projectDescription,
          start_date: new Date().toISOString(),
          end_date: new Date().toISOString(),
          max_attendees: 0,
          image_url: '/placeholder.svg',
          beneficiary_type: 'both',
          event_path: 'environment',
          event_category: 'social',
          event_type: 'in-person'
        }])
        .select()
        .single();

      if (projectError) throw projectError;

      // Then create the department_project connection
      const { error: linkError } = await supabase
        .from('department_projects')
        .insert([{
          department_id: department.id,
          project_id: projectData.id
        }]);

      if (linkError) throw linkError;

      toast.success("تم إضافة المشروع بنجاح");
      setIsAddingProject(false);
      setProjectTitle("");
      setProjectDescription("");
      // Trigger a refresh of the departments data
      window.location.reload();
    } catch (error) {
      console.error('Error adding project:', error);
      toast.error("حدث خطأ أثناء إضافة المشروع");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">إدارة: {department.name}</h3>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>

        {isExpanded && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isAddingProject} onOpenChange={setIsAddingProject}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    إضافة مشروع مهام جديد
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إضافة مشروع مهام جديد</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddProject} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">عنوان المشروع</Label>
                      <Input
                        id="title"
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">وصف المشروع</Label>
                      <Textarea
                        id="description"
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "جاري الإضافة..." : "إضافة"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="pr-6 border-r border-gray-200">
              <ProjectsList projects={department.department_projects || []} />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};