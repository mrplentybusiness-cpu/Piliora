import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import About from "@/pages/About";
import AdminDashboard from "@/pages/AdminDashboard";
import Login from "@/pages/Login";
import { Layout } from "@/components/layout/Layout";
import { AdminLayout } from "@/components/layout/AdminLayout";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/">
        <Layout>
          <Home />
        </Layout>
      </Route>
      <Route path="/about">
        <Layout>
          <About />
        </Layout>
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/login" component={Login} />
      
      <Route path="/admin">
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
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
