
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "@/AppRoutes";
import { Toaster } from "./ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { useEffect } from "react";
import { DeveloperToolbar } from "./developer/DeveloperToolbar";
import { useDeveloperStore } from "@/store/developerStore";

export default function App() {
  const { fetchSettings, settings } = useDeveloperStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster />
      <SonnerToaster position="top-right" richColors />
      {settings?.is_enabled && settings?.show_toolbar && <DeveloperToolbar />}
    </BrowserRouter>
  );
}
