import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import NotFound from "@/pages/not-found";

import Employees from "@/pages/Employees";
import LeaveReport from "@/pages/LeaveReport";
import MealExpenses from "@/pages/MealExpenses";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/">
          {/* Default redirect to employees */}
          {() => <Redirect to="/employees" />}
        </Route>
        <Route path="/employees" component={Employees} />
        <Route path="/leaves" component={LeaveReport} />
        <Route path="/meals" component={MealExpenses} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
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
