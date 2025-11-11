;import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RoleProvider } from "@/contexts/RoleContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Agencies from "./pages/Agencies";
import Manufacturers from "./pages/Manufacturers";
import Crew from "./pages/Crew";
import Rockets from "./pages/Rockets";
import RocketVariants from "./pages/RocketVariants";
import Missions from "./pages/Missions";
import Launches from "./pages/Launches";
import Payloads from "./pages/Payloads";
import CrewAssignments from "./pages/CrewAssignments";
import Graph from "./pages/Graph";
import NotFound from "./pages/NotFound";
import DatabaseInfo from '@/pages/DatabaseInfo';


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <RoleProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/agencies" element={<Agencies />} />
            <Route path="/manufacturers" element={<Manufacturers />} />
            <Route path="/crew" element={<Crew />} />
            <Route path="/rockets" element={<Rockets />} />
            <Route path="/rocket-variants" element={<RocketVariants />} />
            <Route path="/missions" element={<Missions />} />
            <Route path="/launches" element={<Launches />} />
            <Route path="/payloads" element={<Payloads />} />
            <Route path="/crew-assignments" element={<CrewAssignments />} />
            <Route path="/database-info" element={<DatabaseInfo />} />
            <Route path="/graph" element={<Graph />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </RoleProvider>
  </QueryClientProvider>
);

export default App;
