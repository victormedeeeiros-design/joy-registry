import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "@/components/auth/AuthPage";
import PlatformAdminDashboard from "@/components/admin/PlatformAdminDashboard";
import SiteCreatorDashboard from "@/components/creator/SiteCreatorDashboard";
import LayoutSelection from "./pages/LayoutSelection";
import CreateSite from "./pages/CreateSite";
import PublicSite from "./pages/PublicSite";
import EditSite from "./pages/EditSite";
import PaymentSuccess from "./pages/PaymentSuccess";
import GuestLogin from "./pages/GuestLogin";
import ManageProducts from "./pages/ManageProducts";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, userType }: { children: React.ReactNode; userType?: string }) => {
  const { user, profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }
  
  if (userType && profile.user_type !== userType) {
    // Redirect to appropriate dashboard based on user type
    if (profile.user_type === 'platform_admin') {
      return <Navigate to="/admin" replace />;
    } else if (profile.user_type === 'site_creator') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/guest-login" element={<GuestLogin />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute userType="platform_admin">
                <PlatformAdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute userType="site_creator">
                <SiteCreatorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/layouts" 
            element={
              <ProtectedRoute userType="site_creator">
                <LayoutSelection />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-site" 
            element={
              <ProtectedRoute userType="site_creator">
                <CreateSite />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/site/:id" 
            element={<PublicSite />} 
          />
          <Route 
            path="/edit-site/:id" 
            element={
              <ProtectedRoute userType="site_creator">
                <EditSite />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/products" 
            element={
              <ProtectedRoute userType="platform_admin">
                <ManageProducts />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
