
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";

export const TasksHeader = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Detect the active tab from URL hash
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
      </div>
      
      {/* Only show the search input in the workspaces tab */}
      {activeTab === 'workspaces' && (
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="البحث عن مهام، مشاريع، أو مساحات عمل..."
            className="pr-10 w-full"
          />
        </div>
      )}

      <CreateWorkspaceDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </div>
  );
};
