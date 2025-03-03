
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { useParams } from "react-router-dom";
import { CreateTaskProjectForm } from "@/components/tasks/projects/CreateTaskProjectForm";

const CreateTaskProject = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  
  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto" dir="rtl">
            <h1 className="text-2xl font-bold mb-6">إنشاء مشروع مهام جديد</h1>
            <CreateTaskProjectForm workspaceId={workspaceId} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateTaskProject;
