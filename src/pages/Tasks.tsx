
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { TasksHeader } from "@/components/tasks/TasksHeader";
import { TasksOverview } from "@/components/tasks/TasksOverview";
import { TasksWorkspaces } from "@/components/tasks/TasksWorkspaces";
import { TasksYearlyPlan } from "@/components/tasks/TasksYearlyPlan";
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

  // Inject a global style to hide the button directly in TaskListItem
  useEffect(() => {
    // Create style element to hide the deliverables button
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .task-list-item .task-deliverables-button {
        display: none !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <TasksHeader />
        
        {activeTab === 'overview' && <TasksOverview />}
        {activeTab === 'workspaces' && <TasksWorkspaces />}
        {activeTab === 'yearly-plan' && <TasksYearlyPlan />}
      </main>

      <Footer />
    </div>
  );
};

export default Tasks;
