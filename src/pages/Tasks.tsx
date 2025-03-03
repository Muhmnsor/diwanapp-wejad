
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { TasksHeader } from "@/components/tasks/TasksHeader";
import { TasksOverview } from "@/components/tasks/TasksOverview";
import { TasksWorkspaces } from "@/components/tasks/TasksWorkspaces";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const Tasks = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const location = useLocation();

  // استمع للتغييرات في عنوان URL
  useEffect(() => {
    // الحصول على قيمة التبويب من هاش URL إذا وجدت
    const hash = location.hash.replace('#', '');
    if (hash === 'workspaces' || hash === 'overview') {
      setActiveTab(hash);
    }
  }, [location]);

  // تحديث هاش URL عند تغيير التبويب
  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <TasksHeader />
        
        <div className="mt-4">
          {activeTab === "overview" && <TasksOverview />}
          {activeTab === "workspaces" && <TasksWorkspaces />}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Tasks;
