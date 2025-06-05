import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AllAthletes from "./pages/AllAthletes";
import FullSchedule from "./pages/FullSchedule";
import NewsPage from "./app/news/page";
import StatsPage from "./app/stats/page";
import AchievementsPage from "./pages/Achievements";
import SportPage from "./pages/SportPage";
import SportsPage from "./pages/SportsPage";
import Navbar from "./components/Navbar";
import HomeNavbar from "./components/HomeNavbar";
import Footer from "./components/Footer";
import { AuthProvider } from './lib/auth';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import ScrollToTop from './components/ScrollToTop';
import AthletesPage from './pages/AthletesPage';

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      {isHomePage ? <HomeNavbar /> : <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/athletes" element={<AthletesPage />} />
          <Route path="/sports" element={<SportsPage />} />
          <Route path="/schedule" element={<FullSchedule />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/sports/:sport" element={<SportPage />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<UserDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router>
            <AppContent />
          </Router>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
