import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NotificationProvider } from "@/components/app/NotificationProvider";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import AppLayout from "./components/app/AppLayout.tsx";
import Dashboard from "./pages/app/Dashboard.tsx";
import Train from "./pages/app/Train.tsx";
import Plan from "./pages/app/Plan.tsx";
import Progress from "./pages/app/Progress.tsx";
import Analyze from "./pages/app/Analyze.tsx";
import Challenges from "./pages/app/Challenges.tsx";
import Leaderboard from "./pages/app/Leaderboard.tsx";
import DrillLibrary from "./pages/app/DrillLibrary.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <NotificationProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="train" element={<Train />} />
              <Route path="plan" element={<Plan />} />
              <Route path="progress" element={<Progress />} />
              <Route path="analyze" element={<Analyze />} />
              <Route path="challenges" element={<Challenges />} />
              <Route path="leaderboard" element={<Leaderboard />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
