
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { TasksHeader } from "@/components/tasks/TasksHeader";
import { TasksOverview } from "@/components/tasks/TasksOverview";
import { TasksWorkspaces } from "@/components/tasks/TasksWorkspaces";
import { TasksYearlyPlan } from "@/components/tasks/TasksYearlyPlan";
import { TasksReports } from "@/components/tasks/TasksReports";
import { useEffect, useState } from "react";

const Tasks = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Update local state based on URL hash
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'workspaces') {
      setActiveTab('workspaces');
    } else if (hash === 'yearly-plan') {
      setActiveTab('yearly-plan');
    } else if (hash === 'reports') {
      setActiveTab('reports');
    } else {
      setActiveTab('overview');
    }

    // Add custom CSS for task list item buttons
    const style = document.createElement('style');
    style.textContent = `
      .task-list-item-buttons {
        display: flex;
        gap: 0.5rem;
      }
      .task-list-item-buttons .file-upload-btn {
        margin-left: 0.5rem;
      }
    `;
    document.head.appendChild(style);

    const handleHashChange = () => {
      const newHash = window.location.hash.replace('#', '');
      setActiveTab(newHash || 'overview');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <TasksHeader />
        </div>
        
        {activeTab === 'overview' && <TasksOverview />}
        {activeTab === 'workspaces' && <TasksWorkspaces />}
        {activeTab === 'yearly-plan' && <TasksYearlyPlan />}
        {activeTab === 'reports' && <TasksReports />}
      </main>

      <Footer />
    </div>
  );
};

export default Tasks;
