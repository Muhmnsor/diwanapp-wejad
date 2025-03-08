
import { Button } from "@/components/ui/button";
import { Plus, Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";
import { useNavigate } from "react-router-dom";

export const TasksHeader = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

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

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', url: '#' },
    { id: 'workspaces', label: 'مساحات العمل', url: '#workspaces' },
    { id: 'yearly-plan', label: 'الخطة السنوية', url: '#yearly-plan' },
    { id: 'recurring', label: 'المهام المتكررة', url: '#recurring' },
    { id: 'reports', label: 'التقارير', url: '#reports' },
  ];

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
        
        {/* Add recurring tasks button */}
        {activeTab === 'recurring' && (
          <Button 
            onClick={() => navigate('/recurring-tasks/create')}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            إنشاء مهمة متكررة
          </Button>
        )}
        
        {/* You could add a reports-specific button here if needed */}
        {activeTab === 'reports' && (
          <div></div> // مكان محجوز لأزرار تبويب التقارير في المستقبل
        )}
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex space-x-1 space-x-reverse border-b">
        {tabs.map(tab => (
          <a
            key={tab.id}
            href={tab.url}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </a>
        ))}
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
