
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { TasksHeader } from "@/components/tasks/TasksHeader";
import { TasksOverview } from "@/components/tasks/TasksOverview";
import { TasksWorkspaces } from "@/components/tasks/TasksWorkspaces";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Tasks = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <TasksHeader />
        
        <Tabs 
          defaultValue="overview" 
          className="mt-6"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="workspaces">مساحات العمل</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <TasksOverview />
          </TabsContent>
          
          <TabsContent value="workspaces">
            <TasksWorkspaces />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Tasks;
