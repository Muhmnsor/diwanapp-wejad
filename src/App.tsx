import React, { Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import { ProtectedRoutes } from "./routes/ProtectedRoutes";
import PublicRoute from "./components/PublicRoute";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "./components/ErrorBoundary";
import { useTranslation } from "react-i18next";
import "./i18n";
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/SiteHeader"
import { SiteFooter } from "@/components/SiteFooter"
import { HelmetProvider } from "react-helmet-async";

const queryClient = new QueryClient()

function App() {
  return (
    <HelmetProvider>
      <div className="min-h-screen bg-background">
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ErrorBoundary>
              <Router>
                <AuthProvider>
                  <SiteHeader />
                  <main className="container">
                    <Suspense fallback={<div>Loading...</div>}>
                      <Routes>
                        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                        <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
                        <Route path="/" element={<Home />} />
                        <Route path="/profile" element={<Profile />} />
                        {ProtectedRoutes.map((route, index) => route)}
                      </Routes>
                    </Suspense>
                  </main>
                  <SiteFooter />
                  <Toaster />
                </AuthProvider>
              </Router>
            </ErrorBoundary>
          </ThemeProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </div>
    </HelmetProvider>
  );
}

export default App;
