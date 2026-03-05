import { BrowserRouter, Routes, Route } from "react-router";
import { LoginForm } from "./LoginForm";
import { SignUpForm } from "./SignUpForm";
import { Dashboard } from "./Dashboard";
import { TestMolstar } from "./TestMolstar";
import { TestNeurosnapAPI } from "./TestNeurosnapAPI";

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
        <Route path="/home" element={<Dashboard />} />
        <Route path="/test-molstar" element={<TestMolstar />} />
        <Route path="/test-api" element={<TestNeurosnapAPI />} />
      </Routes>
    </BrowserRouter>
  );
}
