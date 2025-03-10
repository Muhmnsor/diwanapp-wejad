
import { Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import CreateTaskProject from "@/pages/CreateTaskProject";
import WorkspaceTaskProjects from "@/pages/WorkspaceTaskProjects";
import TaskProjectDetails from "@/pages/TaskProjectDetails";

export const TaskRoutes = [
  <Route 
    key="create-task-project"
    path="/tasks/create-task-project/:workspaceId" 
    element={
      <ProtectedRoute>
        <CreateTaskProject />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="workspace-tasks"
    path="/tasks/workspace/:workspaceId" 
    element={
      <ProtectedRoute>
        <WorkspaceTaskProjects />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="task-project-details"
    path="/tasks/project/:projectId" 
    element={
      <ProtectedRoute>
        <TaskProjectDetails />
      </ProtectedRoute>
    } 
  />
];

