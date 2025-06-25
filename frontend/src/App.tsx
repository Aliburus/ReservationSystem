import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminLayout from "./components/Admin/AdminLayout";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTrips from "./pages/admin/AdminTrips";
import AdminReservations from "./pages/admin/AdminReservations";
import TripDetailPage from "./pages/TripDetailPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin ana sayfa */}
        <Route
          path="/"
          element={
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/trips/:id"
          element={
            <AdminLayout>
              <TripDetailPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/trips"
          element={
            <AdminLayout>
              <AdminTrips />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/reservations"
          element={
            <AdminLayout>
              <AdminReservations />
            </AdminLayout>
          }
        />
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
