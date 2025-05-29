import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { themeUtils } from '@/lib/theme';
import { useEffect } from 'react';
import { Role } from '@/lib/types';

// Pages
import { Home } from '@/pages/Home';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { ResetPassword } from '@/pages/auth/ResetPassword';
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
import { Leaderboard } from '@/pages/Leaderboard';

function App() {
  // Initialize theme only once when the app loads
  useEffect(() => {
    themeUtils.initialize();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="categories" element={<Categories />} />
            <Route path="categories/:slug" element={<CategoryDetail />} />
            <Route path="topics/latest" element={<LatestTopics />} />
            <Route path="topics/:slug" element={<TopicDetail />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:username" element={<UserProfile />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="help" element={<Help />} />
            
            {/* Protected Routes - require login */}
            <Route path="profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="create-topic" element={
              <ProtectedRoute>
                <CreateTopic />
              </ProtectedRoute>
            } />
            <Route path="create-topic/:categorySlug" element={
              <ProtectedRoute>
                <CreateTopic />
              </ProtectedRoute>
            } />

            {/* Admin Routes - for admin users only */}
            <Route path="admin" element={
              <ProtectedRoute requiredRole={Role.ADMIN}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="admin/users" element={
              <ProtectedRoute requiredRole={Role.ADMIN}>
                <UserManagement />
              </ProtectedRoute>
            } />
            
            {/* Category management - accessible to both admins and teachers */}
            <Route path="admin/categories" element={
              <ProtectedRoute requiredRole={Role.TEACHER}>
                <CategoryManagement />
              </ProtectedRoute>
            } />
            
            <Route path="admin-tool" element={
              <ProtectedRoute>
                <AdminTool />
              </ProtectedRoute>
            } />
          </Route>

          {/* Auth Layout Routes */}
          <Route path="/" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster
        position="top-center"
        richColors
      />
    </AuthProvider>
  );
}

export default App;
