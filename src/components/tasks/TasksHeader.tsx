
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TasksHeaderProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

export const TasksHeader = ({ activeTab, setActiveTab }: TasksHeaderProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">نظام إدارة المهام</h1>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          إنشاء مساحة عمل
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="البحث عن مهام، مشاريع، أو مساحات عمل..."
          className="pr-10 w-full"
        />
      </div>

      <Tabs 
        value={activeTab}
        onValueChange={setActiveTab}
        className="mt-2"
      >
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="workspaces">مساحات العمل</TabsTrigger>
        </TabsList>
      </Tabs>

      <CreateWorkspaceDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </div>
  );
};
