import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import Index from "./pages/Index";
import CreateEvent from "./pages/CreateEvent";
import EventDetails from "./pages/EventDetails";
import Login from "./pages/Login";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <div className="font-sans min-h-screen flex flex-col">
        <TooltipProvider>
          <TopHeader />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <CreateEvent />
                  </ProtectedRoute>
                }
              />
              <Route path="/event/:id" element={<EventDetails />} />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <Users />
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
            </Routes>
          </div>
          <Footer />
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </div>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;