import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar from './components/shared/Navbar';
import AdminSidebar from './components/shared/AdminSidebar';
import ProtectedRoute from './components/shared/ProtectedRoute';

import Home from './pages/Home';
import Landing from './pages/Landing';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Reservations from './pages/Reservations';
import QueuePage from './pages/QueuePage';
import Profile from './pages/Profile';
import QRCheckIn from './pages/QRCheckIn';

import Dashboard from './pages/admin/Dashboard';
import TablesAndQueue from './pages/admin/TablesAndQueue';
import OrdersAdmin from './pages/admin/OrdersAdmin';
import Inventory from './pages/admin/Inventory';
import Staff from './pages/admin/Staff';
import Customers from './pages/admin/Customers';
import Analytics from './pages/admin/Analytics';
import TableQRCodes from './pages/admin/TableQRCodes';
import AdminMenu from './pages/admin/Menu';
import AdminReservations from './pages/admin/Reservations';
import AdminSettings from './pages/admin/Settings';

function CustomerLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function AdminLayout({ children }) {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Customer-facing */}
              <Route path="/" element={<CustomerLayout><Landing /></CustomerLayout>} />
              <Route path="/home" element={<CustomerLayout><Home /></CustomerLayout>} />
              <Route path="/login" element={<CustomerLayout><Landing /></CustomerLayout>} />
              <Route path="/register" element={<CustomerLayout><Landing /></CustomerLayout>} />
              <Route path="/menu" element={<CustomerLayout><Menu /></CustomerLayout>} />
              <Route path="/cart" element={<CustomerLayout><Cart /></CustomerLayout>} />
              <Route path="/qr-checkin" element={<CustomerLayout><QRCheckIn /></CustomerLayout>} />
              <Route path="/queue" element={<CustomerLayout><QueuePage /></CustomerLayout>} />
              <Route
                path="/orders"
                element={<CustomerLayout><ProtectedRoute><Orders /></ProtectedRoute></CustomerLayout>}
              />
              <Route
                path="/reservations"
                element={<CustomerLayout><ProtectedRoute><Reservations /></ProtectedRoute></CustomerLayout>}
              />
              <Route
                path="/profile"
                element={<CustomerLayout><ProtectedRoute><Profile /></ProtectedRoute></CustomerLayout>}
              />

              {/* Admin / staff */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={['admin', 'staff']}>
                    <AdminLayout><Dashboard /></AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/tables"
                element={
                  <ProtectedRoute roles={['admin', 'staff']}>
                    <AdminLayout><TablesAndQueue /></AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute roles={['admin', 'staff']}>
                    <AdminLayout><OrdersAdmin /></AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/inventory"
                element={
                  <ProtectedRoute roles={['admin', 'staff']}>
                    <AdminLayout><Inventory /></AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/staff"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminLayout><Staff /></AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/customers"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminLayout><Customers /></AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminLayout><Analytics /></AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/qr-codes"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminLayout><TableQRCodes /></AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/menu"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminLayout><AdminMenu /></AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reservations"
                element={
                  <ProtectedRoute roles={['admin', 'staff']}>
                    <AdminLayout><AdminReservations /></AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminLayout><AdminSettings /></AdminLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
