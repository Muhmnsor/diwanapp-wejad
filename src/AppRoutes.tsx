
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
import RequestsManagement from "./pages/RequestsManagement";
import ErrorBoundary from "./components/ErrorBoundary";
import { NotificationProvider } from "./contexts/NotificationContext";

// Wrap the protected routes with the NotificationProvider
const ProtectedRouteWithNotifications = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <ProtectedRoute>
          {children}
        </ProtectedRoute>
      </NotificationProvider>
    </ErrorBoundary>
  );
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuthStore();

  console.log('AppRoutes - Current auth state:', { isAuthenticated });

  // Split public and protected routes
  const PublicRoute = ({ children }: { children: React.ReactNode }) => (
    <ErrorBoundary>{children}</ErrorBoundary>
  );

  return (
    <Routes>
      {/* Public routes with ErrorBoundary but no NotificationProvider */}
      <Route path="/" element={<PublicRoute><Index /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/events/:id/feedback" element={<PublicRoute><EventFeedback /></PublicRoute>} />
      <Route path="/activities/:id/feedback" element={<PublicRoute><ActivityFeedback /></PublicRoute>} />
      <Route path="/verify-certificate" element={<PublicRoute><VerifyCertificate /></PublicRoute>} />
      <Route path="/documentation" element={<PublicRoute><Documentation /></PublicRoute>} />
      <Route path="/users" element={<PublicRoute><Users /></PublicRoute>} />
      
      {/* Protected routes with both ErrorBoundary and NotificationProvider */}
      <Route path="/create-event" element={<ProtectedRouteWithNotifications><CreateEvent /></ProtectedRouteWithNotifications>} />
      <Route path="/events/:id" element={<ProtectedRouteWithNotifications><EventDetails /></ProtectedRouteWithNotifications>} />
      <Route path="/create-project" element={<ProtectedRouteWithNotifications><CreateProject /></ProtectedRouteWithNotifications>} />
      <Route path="/projects/:id" element={<ProtectedRouteWithNotifications><ProjectDetails /></ProtectedRouteWithNotifications>} />
      <Route path="/tasks/create-task-project/:workspaceId" element={<ProtectedRouteWithNotifications><CreateTaskProject /></ProtectedRouteWithNotifications>} />
      <Route path="/tasks/workspace/:workspaceId" element={<ProtectedRouteWithNotifications><WorkspaceTaskProjects /></ProtectedRouteWithNotifications>} />
      <Route path="/tasks/project/:projectId" element={<ProtectedRouteWithNotifications><TaskProjectDetails /></ProtectedRouteWithNotifications>} />
      <Route path="/settings" element={<ProtectedRouteWithNotifications><Settings /></ProtectedRouteWithNotifications>} />
      <Route path="/dashboard" element={<ProtectedRouteWithNotifications><Dashboard /></ProtectedRouteWithNotifications>} />
      <Route path="/admin/dashboard" element={<ProtectedRouteWithNotifications><AdminDashboard /></ProtectedRouteWithNotifications>} />
      <Route path="/documents" element={<ProtectedRouteWithNotifications><Documents /></ProtectedRouteWithNotifications>} />
      <Route path="/tasks" element={<ProtectedRouteWithNotifications><Tasks /></ProtectedRouteWithNotifications>} />
      <Route path="/tasks/dashboard" element={<ProtectedRouteWithNotifications><TasksDashboard /></ProtectedRouteWithNotifications>} />
      <Route path="/ideas" element={<ProtectedRouteWithNotifications><Ideas /></ProtectedRouteWithNotifications>} />
      <Route path="/ideas/:id" element={<ProtectedRouteWithNotifications><IdeaDetails /></ProtectedRouteWithNotifications>} />
      <Route path="/finance" element={<ProtectedRouteWithNotifications><Finance /></ProtectedRouteWithNotifications>} />
      <Route path="/portfolios/:id" element={<ProtectedRouteWithNotifications><PortfolioDetails /></ProtectedRouteWithNotifications>} />
      <Route path="/portfolios/:portfolioId/projects/new" element={<ProtectedRouteWithNotifications><NewPortfolioProject /></ProtectedRouteWithNotifications>} />
      <Route path="/portfolio-projects/:projectId" element={<ProtectedRouteWithNotifications><PortfolioProjectDetails /></ProtectedRouteWithNotifications>} />
      <Route path="/portfolio-workspaces/:workspaceId" element={<ProtectedRouteWithNotifications><PortfolioWorkspaceDetails /></ProtectedRouteWithNotifications>} />
      <Route path="/website" element={<ProtectedRouteWithNotifications><WebsiteManagement /></ProtectedRouteWithNotifications>} />
      <Route path="/store" element={<ProtectedRouteWithNotifications><StoreManagement /></ProtectedRouteWithNotifications>} />
      <Route path="/users-management" element={<ProtectedRouteWithNotifications><UsersManagement /></ProtectedRouteWithNotifications>} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/notifications" element={<ProtectedRouteWithNotifications><Notifications /></ProtectedRouteWithNotifications>} />
      <Route path="/general-tasks" element={<ProtectedRouteWithNotifications><GeneralTasks /></ProtectedRouteWithNotifications>} />
      <Route path="/requests" element={<ProtectedRouteWithNotifications><RequestsManagement /></ProtectedRouteWithNotifications>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
