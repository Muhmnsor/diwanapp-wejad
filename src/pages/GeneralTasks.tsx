
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { TasksList } from "@/components/tasks/project-details/TasksList";
import { useGeneralTasks } from "@/components/tasks/project-details/hooks/useGeneralTasks";
import { GeneralTasksStats } from "@/components/tasks/project-details/components/GeneralTasksStats";
import { CategoryTasks } from "@/components/tasks/project-details/components/CategoryTasks";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { AddTaskDialog } from "@/components/tasks/project-details/AddTaskDialog";
import { TasksHeader } from "@/components/tasks/project-details/components/TasksHeader";
import { useProjectMembers } from "@/components/tasks/project-details/hooks/useProjectMembers";
import { EditTaskDialog } from "@/components/tasks/project-details/EditTaskDialog";
import { Task } from "@/components/tasks/project-details/types/task";

const GeneralTasks = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  
  const {
    tasks,
    isLoading,
    tasksByCategory,
    categories,
    stats,
    fetchGeneralTasks,
    handleStatusChange,
    deleteTask
  } = useGeneralTasks();

  // Getting members for task assignment
  // Pass empty string as project ID for general tasks
  const { projectMembers } = useProjectMembers("");

  // Handler for editing a task
  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsEditDialogOpen(true);
  };

  // Filter tasks based on active tab
  const getFilteredTasks = (tasksList) => {
    if (activeTab === "all") return tasksList;
    return tasksList.filter(task => task.status === activeTab);
  };

  // Filter categories based on active tab
  const getFilteredTasksByCategory = () => {
    const result = {};
    
    for (const category in tasksByCategory) {
      const filtered = getFilteredTasks(tasksByCategory[category]);
      if (filtered.length > 0) {
        result[category] = filtered;
      }
    }
    
    return result;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto" dir="rtl">
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-4">المهام العامة</h1>
              <p className="text-gray-600">
                إدارة المهام العامة غير المرتبطة بمشاريع محددة
              </p>
            </div>
            
            <div className="mb-6">
              <GeneralTasksStats stats={stats} />
            </div>
            
            <div className="mb-6">
              <TasksHeader 
                onAddTask={() => setIsAddDialogOpen(true)} 
                isGeneral={true} 
              />
            </div>
            
            <div className="mb-6">
              <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab} dir="rtl">
                <TabsList className="grid grid-cols-5 mb-4">
                  <TabsTrigger value="all">الكل</TabsTrigger>
                  <TabsTrigger value="pending">قيد الانتظار</TabsTrigger>
                  <TabsTrigger value="in_progress">قيد التنفيذ</TabsTrigger>
                  <TabsTrigger value="completed">مكتملة</TabsTrigger>
                  <TabsTrigger value="delayed">متأخرة</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="space-y-6">
              {isLoading ? (
                <div className="text-center py-8">جاري تحميل المهام...</div>
              ) : activeTab === "all" ? (
                categories.map(category => (
                  <CategoryTasks
                    key={category}
                    category={category}
                    tasks={tasksByCategory[category] || []}
                    onStatusChange={handleStatusChange}
                    onDelete={deleteTask}
                    onTaskUpdated={fetchGeneralTasks}
                    onEditTask={handleEditTask}
                    // Pass empty projectId and workspaceId since these are general tasks
                    projectId=""
                    workspaceId=""
                  />
                ))
              ) : (
                Object.entries(getFilteredTasksByCategory()).map(([category, tasks]) => (
                  <CategoryTasks
                    key={category}
                    category={category}
                    tasks={tasks as any}
                    onStatusChange={handleStatusChange}
                    onDelete={deleteTask}
                    onTaskUpdated={fetchGeneralTasks}
                    onEditTask={handleEditTask}
                    // Pass empty projectId and workspaceId since these are general tasks
                    projectId=""
                    workspaceId=""
                  />
                ))
              )}
              
              {!isLoading && Object.keys(getFilteredTasksByCategory()).length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-md border">
                  <p className="text-gray-500">لا توجد مهام {activeTab !== "all" && "بهذه الحالة"}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <AddTaskDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        projectId=""
        projectStages={[]} // Empty for general tasks
        onTaskAdded={fetchGeneralTasks}
        projectMembers={projectMembers}
        isGeneral={true}
      />
      
      {taskToEdit && (
        <EditTaskDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          task={taskToEdit}
          projectStages={[]} // Empty for general tasks
          projectMembers={projectMembers}
          onTaskUpdated={fetchGeneralTasks}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default GeneralTasks;
