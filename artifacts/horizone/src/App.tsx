import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout";
import Home from "@/pages/home";
import Fahrzeuge from "@/pages/fahrzeuge";
import FahrzeugDetail from "@/pages/fahrzeug-detail";
import Haendler from "@/pages/haendler";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import AdminLogin from "@/pages/admin-login";
import { useAdminAuth } from "@/hooks/use-admin-auth";

const queryClient = new QueryClient();

function ProtectedAdmin() {
  const { isAuthenticated } = useAdminAuth();
  const [, navigate] = useLocation();

  if (!isAuthenticated) {
    navigate("/admin/login");
    return null;
  }

  return <Admin />;
}

function Router() {
  return (
    <Switch>
      <Route path="/admin/login">
        <AdminLogin />
      </Route>
      <Route path="/admin">
        <Layout>
          <ProtectedAdmin />
        </Layout>
      </Route>
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/fahrzeuge" component={Fahrzeuge} />
            <Route path="/fahrzeuge/:id" component={FahrzeugDetail} />
            <Route path="/haendler" component={Haendler} />
            <Route path="/dashboard" component={Dashboard} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" storageKey="horizone-theme">
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
