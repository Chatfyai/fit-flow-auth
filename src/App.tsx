import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/progress-indicator";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CreateWorkout from "./pages/CreateWorkout";
import NotFound from "./pages/NotFound";
import TodaysWorkout from './pages/TodaysWorkout';
import Profile from './pages/Profile';
import Agenda from './pages/Agenda';

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="text-center">
          <div className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
            <span className="text-3xl font-bold text-primary-foreground">💪</span>
          </div>
          <LoadingSpinner size="lg" variant="primary" className="mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Carregando aplicação...</p>
          <p className="text-sm text-gray-500 mt-2">Preparando sua experiência fitness</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Dashboard /> : <Index />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Index />} />
        <Route path="/create-workout" element={user ? <CreateWorkout /> : <Index />} />
        <Route path="/treino-do-dia" element={user ? <TodaysWorkout /> : <Index />} />
        <Route path="/profile" element={user ? <Profile /> : <Index />} />
        <Route path="/agenda" element={user ? <Agenda /> : <Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
