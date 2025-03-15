import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
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

function App() {
  // Initialize theme only once when the app loads
  useEffect(() => {
    themeUtils.initialize();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
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
            
            {/* Protected Routes */}
            <Route 
              path="/categories/:slug/create-topic" 
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
        
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
