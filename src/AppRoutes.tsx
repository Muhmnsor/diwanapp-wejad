import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { lazy, Suspense } from "react";
import { LoadingScreen } from "@/components/layout/LoadingScreen";

const Home = lazy(() => import("@/pages/Home"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Profile = lazy(() => import("@/pages/Profile"));
const ProjectDetails = lazy(() => import("@/pages/ProjectDetails"));
const ProjectEdit = lazy(() => import("@/pages/ProjectEdit"));
const ProjectCreate = lazy(() => import("@/pages/ProjectCreate"));
const Tasks = lazy(() => import("@/pages/Tasks"));
const DepartmentTaskProjects = lazy(() => import("@/pages/DepartmentProjects"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export const AppRoutes = () => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <Home />
          </Suspense>
        }
      />
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/" />
          ) : (
            <Suspense fallback={<LoadingScreen />}>
              <Login />
            </Suspense>
          )
        }
      />
      <Route
        path="/register"
        element={
          user ? (
            <Navigate to="/" />
          ) : (
            <Suspense fallback={<LoadingScreen />}>
              <Register />
            </Suspense>
          )
        }
      />
      <Route
        path="/profile"
        element={
          user ? (
            <Suspense fallback={<LoadingScreen />}>
              <Profile />
            </Suspense>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/projects/:id"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <ProjectDetails />
          </Suspense>
        }
      />
      <Route
        path="/projects/:id/edit"
        element={
          user?.isAdmin ? (
            <Suspense fallback={<LoadingScreen />}>
              <ProjectEdit />
            </Suspense>
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/projects/create"
        element={
          user?.isAdmin ? (
            <Suspense fallback={<LoadingScreen />}>
              <ProjectCreate />
            </Suspense>
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/tasks"
        element={
          user?.isAdmin ? (
            <Suspense fallback={<LoadingScreen />}>
              <Tasks />
            </Suspense>
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/departments/:id/projects"
        element={
          user?.isAdmin ? (
            <Suspense fallback={<LoadingScreen />}>
              <DepartmentTaskProjects />
            </Suspense>
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="*"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <NotFound />
          </Suspense>
        }
      />
    </Routes>
  );
};