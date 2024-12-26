import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Settings from "@/pages/Settings";
import Users from "@/pages/Users";
import EventDetails from "@/pages/EventDetails";
import EventFeedback from "@/pages/EventFeedback";
import CreateEvent from "@/pages/CreateEvent";
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Index />} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
        <Route path="/event/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
        <Route path="/events/:id/feedback" element={<EventFeedback />} />
        <Route path="/events/create" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;