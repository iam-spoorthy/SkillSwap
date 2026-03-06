/**
 * Main App Component
 * Routes all pages and provides authentication wrapper
 * Uses createBrowserRouter (v6.4+ data router API) to avoid deprecation warnings
 */

import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Session from './pages/Session';
import Sessions from './pages/Sessions';
import Leaderboard from './pages/Leaderboard';
import AITutor from './pages/AITutor';
import VideoRoom from './pages/VideoRoom';
import Profile from './pages/Profile';

// Protected Route Wrapper — redirects unauthenticated users to /login
function ProtectedRoute() {
  const token = useAuthStore(state => state.token);
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// Public Route Wrapper — redirects authenticated users to /dashboard
function PublicRoute() {
  const token = useAuthStore(state => state.token);
  if (token) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

// Router definition using the modern createBrowserRouter API
const router = createBrowserRouter([
  // Public routes (redirect to dashboard if already logged in)
  {
    element: <PublicRoute />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
    ],
  },
  // Protected routes (redirect to login if not authenticated)
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/book-session', element: <Session /> },
      { path: '/sessions', element: <Sessions /> },
      { path: '/leaderboard', element: <Leaderboard /> },
      { path: '/ai-session', element: <AITutor /> },
      { path: '/room/:sessionId', element: <VideoRoom /> },
      { path: '/profile', element: <Profile /> },
    ],
  },
  // Fallback — redirect unknown paths to home
  { path: '*', element: <Navigate to="/" replace /> },
], {
  // Opt-in to v7 behavior to suppress deprecation warnings
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  },
});

export default function App() {
  return (
    <>
      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          success: {
            style: {
              background: '#10b981',
              color: '#fff',
            },
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />

      {/* Router renders the matched route */}
      <RouterProvider router={router} />
    </>
  );
}
