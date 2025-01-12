import { Routes, Route } from "react-router-dom";
import { PrivateRoute } from "@/components/auth/PrivateRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { Login } from "@/pages/auth/Login";
import { Register } from "@/pages/auth/Register";
import { ForgotPassword } from "@/pages/auth/ForgotPassword";
import { ResetPassword } from "@/pages/auth/ResetPassword";
import { Home } from "@/pages/Home";
import { Dashboard } from "@/pages/Dashboard";
import { Settings } from "@/pages/Settings";
import { Events } from "@/pages/Events";
import { EventDetails } from "@/pages/EventDetails";
import { Projects } from "@/pages/Projects";
import { ProjectDetails } from "@/pages/ProjectDetails";
import { CreateProject } from "@/pages/CreateProject";
import { Tasks } from "@/pages/Tasks";
import { MyTasks } from "@/pages/MyTasks";
import { TasksDashboard } from "@/pages/TasksDashboard";
import { TasksSettings } from "@/pages/TasksSettings";
import { Departments } from "@/pages/Departments";
import { DepartmentDetails } from "@/pages/DepartmentDetails";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path="/create-project" element={<CreateProject />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/tasks/my-tasks" element={<MyTasks />} />
        <Route path="/tasks/dashboard" element={<TasksDashboard />} />
        <Route path="/tasks/settings" element={<TasksSettings />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/departments/:id" element={<DepartmentDetails />} />
      </Route>

      <Route element={<AdminRoute />}>
        {/* Add admin-only routes here */}
      </Route>
    </Routes>
  );
};

export default AppRoutes;