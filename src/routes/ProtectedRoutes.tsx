
import { Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Settings from "@/pages/Settings";
import AdminDashboard from "@/pages/AdminDashboard";
import Documents from "@/pages/Documents";
import Tasks from "@/pages/Tasks";
import TasksDashboard from "@/pages/TasksDashboard";
import Finance from "@/pages/Finance";
import WebsiteManagement from "@/pages/WebsiteManagement";
import StoreManagement from "@/pages/StoreManagement";
import UsersManagement from "@/pages/UsersManagement";
import Notifications from "@/pages/Notifications";
import RequestsManagement from "@/pages/RequestsManagement";
import React from "react";
import DeveloperRoute from "@/components/DeveloperRoute";
import MeetingsPage from "@/pages/meetings/MeetingsPage";
import MeetingFolderPage from "@/components/meetings/folders/MeetingFolderPage";
import MeetingDetailsPage from "@/pages/meetings/MeetingDetailsPage";
import InternalMail from "@/pages/InternalMail";

export const ProtectedRoutes = [
  <Route 
    key="settings"
    path="/settings" 
    element={
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="admin-dashboard"
    path="/admin/dashboard" 
    element={
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="admin-meetings"
    path="/admin/meetings" 
    element={
      <ProtectedRoute>
        <MeetingsPage />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="admin-meetings-folder"
    path="/admin/meetings/folders/:folderId" 
    element={
      <ProtectedRoute>
        <MeetingFolderPage />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="admin-meeting-details"
    path="/admin/meetings/:meetingId" 
    element={
      <ProtectedRoute>
        <MeetingDetailsPage />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="documents"
    path="/documents" 
    element={
      <ProtectedRoute>
        <Documents />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="tasks"
    path="/tasks" 
    element={
      <ProtectedRoute>
        <Tasks />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="tasks-dashboard"
    path="/tasks/dashboard" 
    element={
      <ProtectedRoute>
        <TasksDashboard />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="finance"
    path="/finance" 
    element={
      <ProtectedRoute>
        <Finance />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="website"
    path="/website" 
    element={
      <ProtectedRoute>
        <WebsiteManagement />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="store"
    path="/store" 
    element={
      <ProtectedRoute>
        <StoreManagement />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="users-management"
    path="/users-management" 
    element={
      <ProtectedRoute>
        <UsersManagement />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="admin-users-management"
    path="/admin/users-management" 
    element={
      <ProtectedRoute>
        <UsersManagement />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="notifications"
    path="/notifications" 
    element={
      <ProtectedRoute>
        <React.Suspense fallback={<div>Loading...</div>}>
          <Notifications />
        </React.Suspense>
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="requests"
    path="/requests" 
    element={
      <ProtectedRoute>
        <RequestsManagement />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="internal-mail"
    path="/internal-mail" 
    element={
      <ProtectedRoute>
        <InternalMail />
      </ProtectedRoute>
    } 
  />
];
