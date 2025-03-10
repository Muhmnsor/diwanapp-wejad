
import { Route } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import CreateEvent from "@/pages/CreateEvent";
import EventDetails from "@/pages/EventDetails";
import CreateProject from "@/pages/CreateProject";
import ProjectDetails from "@/pages/ProjectDetails";
import Users from "@/pages/Users";
import EventFeedback from "@/pages/EventFeedback";
import ActivityFeedback from "@/pages/ActivityFeedback";
import VerifyCertificate from "@/pages/VerifyCertificate";
import Dashboard from "@/pages/Dashboard";
import Ideas from "@/pages/Ideas";
import IdeaDetails from "@/pages/IdeaDetails";
import Documentation from "@/pages/Documentation";
import GeneralTasks from "@/pages/GeneralTasks";

export const MainRoutes = [
  <Route key="index" path="/" element={<Index />} />,
  <Route key="login" path="/login" element={<Login />} />,
  <Route key="create-event" path="/create-event" element={<CreateEvent />} />,
  <Route key="event-details" path="/events/:id" element={<EventDetails />} />,
  <Route key="create-project" path="/create-project" element={<CreateProject />} />,
  <Route key="project-details" path="/projects/:id" element={<ProjectDetails />} />,
  <Route key="users" path="/users" element={<Users />} />,
  <Route key="event-feedback" path="/events/:id/feedback" element={<EventFeedback />} />,
  <Route key="activity-feedback" path="/activities/:id/feedback" element={<ActivityFeedback />} />,
  <Route key="verify-certificate" path="/verify-certificate" element={<VerifyCertificate />} />,
  <Route key="dashboard" path="/dashboard" element={<Dashboard />} />,
  <Route key="ideas" path="/ideas" element={<Ideas />} />,
  <Route key="idea-details" path="/ideas/:id" element={<IdeaDetails />} />,
  <Route key="documentation" path="/documentation" element={<Documentation />} />,
  <Route key="general-tasks" path="/general-tasks" element={<GeneralTasks />} />
];

