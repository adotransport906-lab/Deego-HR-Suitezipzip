import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import NotFound from "@/pages/not-found";
import { NepaliDateDisplay } from "@/components/NepaliDateDisplay";

import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employees";
import Attendance from "@/pages/Attendance";
import LeaveReport from "@/pages/LeaveReport";
import KitchenExpenses from "@/pages/KitchenExpenses";
import OfficeExpenses from "@/pages/OfficeExpenses";
import Overall from "@/pages/Overall";

function Router() {
  return (
    <>
      <NepaliDateDisplay />
      <Layout>
        <Switch>
          <Route path="/">{() => <Redirect to="/dashboard" />}</Route>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/employees" component={Employees} />
          <Route path="/attendance" component={Attendance} />
          <Route path="/leaves" component={LeaveReport} />
          <Route path="/kitchen" component={KitchenExpenses} />
          <Route path="/office" component={OfficeExpenses} />
          <Route path="/overall" component={Overall} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
