import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import EventDetails from "./pages/EventDetails";
import CreateEvent from "./pages/CreateEvent";
import EventFeedback from "./pages/EventFeedback";
import ActivityFeedback from "./pages/ActivityFeedback";
import ProjectDetails from "./pages/ProjectDetails";
import CreateProject from "./pages/CreateProject";
import EditProject from "./pages/EditProject";
import VerifyCertificate from "./pages/VerifyCertificate";
import ProtectedRoute from "./components/ProtectedRoute";
import Tasks from "./pages/Tasks";
import Notifications from "./pages/Notifications";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/events/:id" element={<EventDetails />} />
      <Route path="/projects/:id" element={<ProjectDetails />} />
      <Route path="/event/:id/feedback" element={<EventFeedback />} />
      <Route path="/activity/:id/feedback" element={<ActivityFeedback />} />
      <Route path="/verify-certificate/:code" element={<VerifyCertificate />} />
      
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute requireAdmin>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute requireAdmin>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/create"
        element={
          <ProtectedRoute requirePermission="events.create">
            <CreateEvent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-project"
        element={
          <ProtectedRoute requirePermission="projects.create">
            <CreateProject />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id/edit"
        element={
          <ProtectedRoute requirePermission="projects.edit">
            <EditProject />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;