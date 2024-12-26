import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EventDetails from "./pages/EventDetails";
import CreateEvent from "./pages/CreateEvent";
import Settings from "./pages/Settings";
import Home from "./pages/Home";
import EventFeedback from "./pages/EventFeedback";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/feedback/:id" element={<EventFeedback />} />
      </Routes>
    </Router>
  );
}

export default App;
