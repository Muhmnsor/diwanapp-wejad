import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import CreateEvent from "./pages/CreateEvent";
import EventDetails from "./pages/EventDetails";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import EventFeedback from "./pages/EventFeedback";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/event/:id" element={<EventDetails />} />
        <Route
          path="/event/create"
          element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-event"
          element={<Navigate to="/event/create" replace />}
        />
        <Route
          path="/event/edit/:id"
          element={
            <ProtectedRoute>
              <CreateEvent />
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
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route path="/event/:id/feedback" element={<EventFeedback />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;