import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Customers from '../pages/Customers';
import Orders from '../pages/Orders';
import Products from '../pages/Products';
import Suppliers from '../pages/Suppliers';
import AIAssistant from '../pages/AIAssistant';
import PointOfSale from '../pages/PointOfSale';
import { useAuth } from '../context/AuthContext';

function HomeRedirect() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={isAdmin ? '/' : '/sales'} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute adminOnly>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PointOfSale />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute adminOnly>
            <MainLayout>
              <Customers />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Orders />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute adminOnly>
            <MainLayout>
              <Products />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/suppliers"
        element={
          <ProtectedRoute adminOnly>
            <MainLayout>
              <Suppliers />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai"
        element={
          <ProtectedRoute>
            <MainLayout>
              <AIAssistant />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
