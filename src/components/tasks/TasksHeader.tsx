// src/components/TasksHeader.tsx

import { Button } from "@/components/ui/button";
import { Plus, Search, Repeat } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";
import { RecurringTaskDialog } from "./project-details/components/recurring/RecurringTaskDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProjectMember } from "./project-details/types/projectMember";
import { useAuthStore } from "@/store/authStore";

export const TasksHeader = () => {
  const { user } = useAuthStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const updateFromHash = () => {
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
    };

    updateFromHash();
    window.addEventListener('hashchange', updateFromHash);
    return () => {
      window.removeEventListener('hashchange', updateFromHash);
    };
  }, []);

  useEffect(() => {
    const fetchAvailableUsers = async () => {
      if (activeTab === 'recurring' && isRecurringDialogOpen) {
        setIsLoading(true);
        try {
          const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, display_name, email')
            .order('display_name', { ascending: true });

          if (error) throw error;

          const formattedMembers: ProjectMember[] = profiles.map(profile => ({
            id: profile.id,
            user_id: profile.id,
            user_display_name: profile.display_name,
            user_email: profile.email,
            role: profile.id === user?.id ? 'admin' : 'member'
          }));

          setProjectMembers(formattedMembers);
        } catch (error) {
          console.error("Error fetching profiles:", error);
          toast.error("حدث خطأ أثناء تحميل قائمة الأعضاء");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAvailableUsers();
  }, [activeTab, isRecurringDialogOpen, user?.id]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">نظام إدارة المهام</h1>

          <div className="flex flex-wrap gap-3">
            {activeTab === 'workspaces' && 
              (user?.role === 'admin' || user?.role === 'مدير ادارة' || user?.role === 'developer') && (
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 ml-2" />
                <span>إنشاء مساحة عمل</span>
              </Button>
            )}

            {activeTab === 'recurring' && (
              <Button 
                onClick={() => setIsRecurringDialogOpen(true)}
                variant="secondary"
              >
                <Repeat className="h-4 w-4 ml-2" />
                <span>إضافة مهمة متكررة</span>
              </Button>
            )}
          </div>
        </div>

        {(activeTab === 'workspaces' || activeTab === 'recurring') && (
          <div className="relative w-full lg:max-w-[320px]">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder={activeTab === 'recurring' ? "بحث في المهام المتكررة..." : "بحث..."}
              className="pr-10 w-full bg-gray-50 border-gray-200 focus:border-primary/50 focus:ring-primary/50"
            />
          </div>
        )}
      </div>

      <CreateWorkspaceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <RecurringTaskDialog
        open={isRecurringDialogOpen}
        onOpenChange={setIsRecurringDialogOpen}
        projectMembers={projectMembers}
        onRecurringTaskAdded={() => {
          // Refresh recurring tasks list if needed
        }}
      />
    </div>
  );
};
