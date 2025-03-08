
import { Button } from "@/components/ui/button";
import { Plus, Search, Calendar, Repeat } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";
import { RecurringTaskDialog } from "./project-details/components/recurring/RecurringTaskDialog";

export const TasksHeader = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Detect the active tab from URL hash
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'workspaces') {
      setActiveTab('workspaces');
    } else if (hash === 'yearly-plan') {
      setActiveTab('yearly-plan');
    } else if (hash === 'reports') {
      setActiveTab('reports');
    } else if (hash === 'recurring') {
      setActiveTab('recurring');
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
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">نظام إدارة المهام</h1>
        {/* Only show the create workspace button in the workspaces tab */}
        {activeTab === 'workspaces' && (
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            إنشاء مساحة عمل
          </Button>
        )}
        
        {/* Add recurring task button in the recurring tab */}
        {activeTab === 'recurring' && (
          <Button 
            onClick={() => setIsRecurringDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Repeat className="h-4 w-4" />
            إضافة مهمة متكررة
          </Button>
        )}
        
        {/* You could add a reports-specific button here if needed */}
        {activeTab === 'reports' && (
          <div></div> // مكان محجوز لأزرار تبويب التقارير في المستقبل
        )}
      </div>
      
      {/* Only show the search input in the workspaces tab or recurring tab */}
      {(activeTab === 'workspaces' || activeTab === 'recurring') && (
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder={activeTab === 'recurring' 
              ? "البحث عن مهام متكررة..." 
              : "البحث عن مهام، مشاريع، أو مساحات عمل..."}
            className="pr-10 w-full"
          />
        </div>
      )}

      <CreateWorkspaceDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />

      {/* Add RecurringTaskDialog with necessary props */}
      <RecurringTaskDialog
        open={isRecurringDialogOpen}
        onOpenChange={setIsRecurringDialogOpen}
        projectMembers={[]}
        onRecurringTaskAdded={() => {}}
      />
    </div>
  );
};
