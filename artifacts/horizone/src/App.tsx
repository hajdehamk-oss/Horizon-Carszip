import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { VisitorNameDialog } from "@/components/visitor-name-dialog";
import { useVisitorProfile } from "@/hooks/use-visitor-profile";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout";
import Home from "@/pages/home";
import Fahrzeuge from "@/pages/fahrzeuge";
import FahrzeugDetail from "@/pages/fahrzeug-detail";
import Haendler from "@/pages/haendler";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import AdminLogin from "@/pages/admin-login";
import HaendlerDetail from "@/pages/haendler-detail";
import Vergleich from "@/pages/vergleich";
import { CompareBar } from "@/components/compare-bar";
import { CompareProvider } from "@/contexts/compare-context";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Redirect } from "wouter";
import { setAuthTokenGetter } from "@workspace/api-client-react";

const ADMIN_TOKEN_KEY = "horizone_admin_token";
setAuthTokenGetter(() => localStorage.getItem(ADMIN_TOKEN_KEY));

const queryClient = new QueryClient();

function AdminGuard() {
  const { isAuthenticated } = useAdminAuth();
  if (!isAuthenticated) return <Redirect to="/admin/login" />;
  return <Admin />;
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/fahrzeuge" component={Fahrzeuge} />
        <Route path="/fahrzeuge/:id" component={FahrzeugDetail} />
        <Route path="/haendler" component={Haendler} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/profil" component={Dashboard} />
        <Route path="/haendler/:id" component={HaendlerDetail} />
        <Route path="/vergleich" component={Vergleich} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin" component={AdminGuard} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location]);
  return null;
}

function AppContent() {
  const { loaded, hasName, updateProfile } = useVisitorProfile();
  const [location] = useLocation();

  const isProfilePage = location === "/dashboard" || location === "/profil" || location.startsWith("/admin");

  return (
    <>
      <ScrollToTop />
      {loaded && !hasName && !isProfilePage && (
        <VisitorNameDialog
          open={true}
          onSave={(name) => updateProfile({ name })}
        />
      )}
      <Router />
      <CompareBar />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" storageKey="horizone-theme">
        <TooltipProvider>
          <CompareProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <AppContent />
            </WouterRouter>
            <Toaster />
          </CompareProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
