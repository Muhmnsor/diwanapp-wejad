
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { TasksHeader } from "@/components/tasks/TasksHeader";
import { TasksOverview } from "@/components/tasks/TasksOverview";
import { TasksWorkspaces } from "@/components/tasks/TasksWorkspaces";
import { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";

const Tasks = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <TasksHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        
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
