
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { useParams } from "react-router-dom";
import { TaskProjectsList } from "@/components/tasks/projects/TaskProjectsList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WorkspaceTaskProjects = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  
  const handleCreateProject = () => {
    navigate(`/tasks/create-task-project/${workspaceId}`);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto" dir="rtl">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">مشاريع مساحة العمل</h1>
              <Button onClick={handleCreateProject} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                إنشاء مشروع جديد
              </Button>
            </div>
            {workspaceId && <TaskProjectsList workspaceId={workspaceId} />}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WorkspaceTaskProjects;
