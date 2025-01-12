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
import Ideas from "./pages/Ideas";
import Finance from "./pages/Finance";
import PortfolioDetails from "./pages/PortfolioDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/create-event" element={<CreateEvent />} />
      <Route path="/events/:id" element={<EventDetails />} />
      <Route path="/create-project" element={<CreateProject />} />
      <Route path="/projects/:id" element={<ProjectDetails />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/users" element={<Users />} />
      <Route path="/events/:id/feedback" element={<EventFeedback />} />
      <Route path="/activities/:id/feedback" element={<ActivityFeedback />} />
      <Route path="/portfolios/:id" element={<PortfolioDetails />} />
      <Route path="/verify-certificate" element={<VerifyCertificate />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/ideas" element={<Ideas />} />
      <Route 
        path="/finance" 
        element={
          <ProtectedRoute>
            <Finance />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;