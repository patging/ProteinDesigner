import { BrowserRouter, Routes, Route } from "react-router";
import { LoginForm } from "./LoginForm";
import { SignUpForm } from "./SignUpForm";
import {TempHome} from './TempHome'

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
        <Route path = "/home" element = {<TempHome/>} />
      </Routes>
    </BrowserRouter>
  );
}
