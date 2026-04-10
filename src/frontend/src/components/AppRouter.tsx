import { BrowserRouter, Routes, Route } from "react-router";
import { LoginForm } from "./LoginForm";
import { SignUpForm } from "./SignUpForm";
import { Dashboard } from "./Dashboard";
import { JobForm } from "./JobForm";
import { Settings } from "./Settings"
import { JobResults } from "./JobResults";
import { ProtectedRoute } from "./ProtectedRoute";

/**
 * AppRouter
 *
 * Using React Router Declarative Form
 * https://reactrouter.com/start/declarative/routing
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <JobForm />
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
          path="/results/:jobId"
          element={
            <ProtectedRoute>
              <JobResults />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
