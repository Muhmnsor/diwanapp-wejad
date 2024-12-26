import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EventDetails from "./pages/EventDetails";
import CreateEvent from "./pages/CreateEvent";
import Settings from "./pages/Settings";
import Index from "./pages/Index";
import EventFeedback from "./pages/EventFeedback";
import Login from "./pages/Login";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/feedback/:id" element={<EventFeedback />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;