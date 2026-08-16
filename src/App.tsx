import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NotFound } from "@/components/NotFound";
import LandingPage from "@/routes/index";
import LoginPage from "@/routes/login";
import SignupPage from "@/routes/signup";
import DashboardPage from "@/routes/dashboard";
import HistoryPage from "@/routes/history";
import PricingPage from "@/routes/pricing";
import ProfilePage from "@/routes/profile";

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
