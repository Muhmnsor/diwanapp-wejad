import { Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import CreateEvent from "./pages/CreateEvent";
import EventDetails from "./pages/EventDetails";
import CreateProject from "./pages/CreateProject";
import ProjectDetails from "./pages/ProjectDetails";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import EventFeedback from "./pages/EventFeedback";
import ActivityFeedback from "./pages/ActivityFeedback";
import VerifyCertificate from "./pages/VerifyCertificate";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Documents from "./pages/Documents";
import Tasks from "./pages/Tasks";
import TasksDashboard from "./pages/TasksDashboard";
import Ideas from "./pages/Ideas";
import Finance from "./pages/Finance";
import PortfolioDetails from "./pages/PortfolioDetails";
import NewPortfolioProject from "./pages/NewPortfolioProject";
import PortfolioProjectDetails from "./pages/PortfolioProjectDetails";
import PortfolioWorkspaceDetails from "./pages/PortfolioWorkspaceDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import IdeaDetails from "./pages/IdeaDetails";
import UsersManagement from "./pages/UsersManagement";
import WebsiteManagement from "./pages/WebsiteManagement";
import StoreManagement from "./pages/StoreManagement";
import CreateTaskProject from "./pages/CreateTaskProject";
import WorkspaceTaskProjects from "./pages/WorkspaceTaskProjects";
import TaskProjectDetails from "./pages/TaskProjectDetails";
import Documentation from "./pages/Documentation";
import Notifications from "./pages/Notifications";
import React from "react";
import GeneralTasks from "./pages/GeneralTasks";

const AppRoutes = () => {
  const { isAuthenticated } = useAuthStore();

  console.log('AppRoutes - Current auth state:', { isAuthenticated });

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/create-event" element={<CreateEvent />} />
      <Route path="/events/:id" element={<EventDetails />} />
      <Route path="/create-project" element={<CreateProject />} />
      <Route path="/projects/:id" element={<ProjectDetails />} />
      <Route 
        path="/tasks/create-task-project/:workspaceId" 
        element={
          <ProtectedRoute>
            <CreateTaskProject />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tasks/workspace/:workspaceId" 
        element={
          <ProtectedRoute>
            <WorkspaceTaskProjects />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tasks/project/:projectId" 
        element={
          <ProtectedRoute>
            <TaskProjectDetails />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      />
      <Route path="/users" element={<Users />} />
      <Route path="/events/:id/feedback" element={<EventFeedback />} />
      <Route path="/activities/:id/feedback" element={<ActivityFeedback />} />
      <Route path="/verify-certificate" element={<VerifyCertificate />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="/documents" element={<Documents />} />
      <Route 
        path="/tasks" 
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tasks/dashboard" 
        element={
          <ProtectedRoute>
            <TasksDashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="/ideas" element={<Ideas />} />
      <Route path="/ideas/:id" element={<IdeaDetails />} />
      <Route 
        path="/finance" 
        element={
          <ProtectedRoute>
            <Finance />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/portfolios/:id" 
        element={
          <ProtectedRoute>
            <PortfolioDetails />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/portfolios/:portfolioId/projects/new" 
        element={
          <ProtectedRoute>
            <NewPortfolioProject />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/portfolio-projects/:projectId" 
        element={
          <ProtectedRoute>
            <PortfolioProjectDetails />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/portfolio-workspaces/:workspaceId" 
        element={
          <ProtectedRoute>
            <PortfolioWorkspaceDetails />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/website" 
        element={
          <ProtectedRoute>
            <WebsiteManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/store" 
        element={
          <ProtectedRoute>
            <StoreManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/users-management" 
        element={
          <ProtectedRoute>
            <UsersManagement />
          </ProtectedRoute>
        } 
      />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <Notifications />
            </React.Suspense>
          </ProtectedRoute>
        } 
      />
      <Route path="/documentation" element={<Documentation />} />
      <Route path="/general-tasks" element={<GeneralTasks />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
