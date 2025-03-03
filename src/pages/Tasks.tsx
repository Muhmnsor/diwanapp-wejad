
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { TasksHeader } from "@/components/tasks/TasksHeader";
import { TasksOverview } from "@/components/tasks/TasksOverview";
import { TasksWorkspaces } from "@/components/tasks/TasksWorkspaces";
import { useEffect, useState } from "react";
import { TabsContent } from "@/components/ui/tabs";

const Tasks = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Update local state based on URL hash
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'workspaces') {
      setActiveTab('workspaces');
    } else {
      setActiveTab('overview');
    }

    const handleHashChange = () => {
      const newHash = window.location.hash.replace('#', '');
      setActiveTab(newHash || 'overview');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <TasksHeader />
        
        {activeTab === 'overview' && <TasksOverview />}
        {activeTab === 'workspaces' && <TasksWorkspaces />}
      </main>

      <Footer />
    </div>
  );
};

export default Tasks;
