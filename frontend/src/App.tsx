import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout/Layout";
import AdminLayout from "./components/Admin/AdminLayout";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

// Pages
import HomePage from "./pages/HomePage";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm";
import TripsPage from "./pages/TripsPage";
import BookingPage from "./pages/BookingPage";
import DashboardPage from "./pages/DashboardPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTrips from "./pages/admin/AdminTrips";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReservations from "./pages/admin/AdminReservations";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <Layout>
                <HomePage />
              </Layout>
            }
          />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route
            path="/trips"
            element={
              <Layout>
                <TripsPage />
              </Layout>
            }
          />

          {/* Protected user routes */}
          <Route
            path="/booking/:tripId"
            element={
              <ProtectedRoute>
                <Layout>
                  <BookingPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/trips"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminTrips />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reservations"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminReservations />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
