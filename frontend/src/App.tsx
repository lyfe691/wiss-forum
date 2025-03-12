import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Pages
import { Home } from '@/pages/Home';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { Categories } from '@/pages/categories/Categories';
import { CategoryDetail } from '@/pages/categories/CategoryDetail';
import { CreateTopic } from '@/pages/topics/CreateTopic';
import { TopicDetail } from '@/pages/topics/TopicDetail';
import { LatestTopics } from '@/pages/topics/LatestTopics';
import { Profile } from '@/pages/Profile';
import NotFound from '@/pages/NotFound';

function App() {
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
            
            {/* Admin Routes */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute requiredRole="admin">
                  {/* Admin pages will be added later */}
                  <div>Admin Dashboard</div>
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
