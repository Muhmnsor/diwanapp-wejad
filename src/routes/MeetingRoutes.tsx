
import { Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import MeetingFoldersPage from "@/pages/meetings/MeetingFoldersPage";
import MeetingFolderPage from "@/pages/meetings/MeetingFolderPage";
import MeetingsPage from "@/pages/meetings/MeetingsPage";
import MeetingDetailsPage from "@/pages/meetings/MeetingDetailsPage";

export const MeetingRoutes = [
  <Route
    path="/admin/meetings"
    element={
      <ProtectedRoute>
        <MeetingFoldersPage />
      </ProtectedRoute>
    }
    key="meetings-folders"
  />,
  <Route
    path="/admin/meetings/folder/:id"
    element={
      <ProtectedRoute>
        <MeetingFolderPage />
      </ProtectedRoute>
    }
    key="meeting-folder"
  />,
  <Route
    path="/admin/meetings/list"
    element={
      <ProtectedRoute>
        <MeetingsPage />
      </ProtectedRoute>
    }
    key="meetings-list"
  />,
  <Route
    path="/admin/meetings/:id"
    element={
      <ProtectedRoute>
        <MeetingDetailsPage />
      </ProtectedRoute>
    }
    key="meeting-details"
  />
];
