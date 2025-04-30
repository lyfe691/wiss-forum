import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { themeUtils } from '@/lib/theme';
import { useEffect } from 'react';

// Pages
import { Home } from '@/pages/Home';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { Categories } from '@/pages/categories/Categories';
import { CategoryDetail } from '@/pages/categories/CategoryDetail';
import { CreateTopic } from '@/pages/topics/CreateTopic';
import { TopicDetail } from '@/pages/topics/TopicDetail';
import { LatestTopics } from '@/pages/topics/LatestTopics';
import { Users } from '@/pages/users/Users';
import { UserProfile } from '@/pages/users/UserProfile';
import { Profile } from '@/pages/Profile';
import { Settings } from '@/pages/Settings';
import { AdminTool } from '@/pages/AdminTool';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { UserManagement } from '@/pages/admin/UserManagement';
import { CategoryManagement } from '@/pages/admin/CategoryManagement';
import NotFound from '@/pages/NotFound';
import { Help } from '@/pages/Help';

function App() {
  // Initialize theme only once when the app loads
  useEffect(() => {
    themeUtils.initialize();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Auth Routes with AuthLayout */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Main Layout Routes */}
          <Route element={<MainLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:slug" element={<CategoryDetail />} />
            <Route path="/topics/latest" element={<LatestTopics />} />
            <Route path="/topics/:slug" element={<TopicDetail />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/:idOrUsername" element={<UserProfile />} />
            <Route path="/admin-tool" element={<AdminTool />} />
            <Route path="/help" element={<Help />} />
            
            {/* Protected Routes */}
            <Route 
              path="/create-topic" 
              element={
                <ProtectedRoute>
                  <CreateTopic />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/create-topic/:slug" 
              element={
                <ProtectedRoute>
                  <CreateTopic />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserManagement />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/categories" 
              element={
                <ProtectedRoute requiredRole="teacher">
                  <CategoryManagement />
                </ProtectedRoute>
              }
            />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>

        <Toaster
          richColors 
          duration={5000}
          position="top-center"
          toastOptions={{
            classNames: {
              toast: "group border border-border",
              title: "font-medium text-foreground",
              description: "text-muted-foreground text-sm",
              actionButton: "bg-primary text-primary-foreground",
              cancelButton: "bg-muted text-foreground"
            }
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
