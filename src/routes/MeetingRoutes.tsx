import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminMeetings from "@/pages/AdminMeetings";
import MeetingFoldersPage from "@/pages/meetings/MeetingFoldersPage";
import MeetingFolderPage from "@/pages/meetings/MeetingFolderPage";
import MeetingsPage from "@/pages/meetings/MeetingsPage";

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
  // This keeps existing routes like meeting details
];
