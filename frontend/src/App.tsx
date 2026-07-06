import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import ExperiencePage from "./pages/Experience";
import LandingPage from "./pages/Landing";
import PrepPage from "./pages/Prep";
import ResumePage from "./pages/Resume";
import ReviewPage from "./pages/Review";

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Navigate to="/resume" replace />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/prep" element={<PrepPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/experience" element={<ExperiencePage />} />
        <Route path="*" element={<Navigate to="/resume" replace />} />
      </Route>
    </Routes>
  );
}
