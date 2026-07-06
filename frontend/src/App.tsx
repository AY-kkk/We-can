import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAdmin, RequireAuth } from "./components/Guards";
import { AdminLayout } from "./layouts/AdminLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ExperiencePage from "./pages/Experience";
import LandingPage from "./pages/Landing";
import PrepPage from "./pages/Prep";
import ResumePage from "./pages/Resume";
import ReviewPage from "./pages/Review";

export default function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route index element={<Navigate to="/auth/login" replace />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot" element={<ForgotPassword />} />
      </Route>

      {/* Admin (admin only) */}
      <Route
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Route>

      {/* App (login required) */}
      <Route
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/resume" replace />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/prep" element={<PrepPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/experience" element={<ExperiencePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/resume" replace />} />
    </Routes>
  );
}
