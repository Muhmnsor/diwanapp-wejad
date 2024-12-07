import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CreateEvent from "./pages/CreateEvent";
import EventDetails from "./pages/EventDetails";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <div className="font-sans">
        <TooltipProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/create" element={<CreateEvent />} />
            <Route path="/event/:id" element={<EventDetails />} />
          </Routes>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </div>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;