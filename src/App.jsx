import React, { createContext, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button, Badge, Navbar, Nav } from "react-bootstrap";
import Switch from "react-switch";
import {
  FaEdit,
  FaShoppingCart,
  FaBars,
  FaHistory,
  FaBox,
  FaHome,
  FaSignOutAlt,
} from "react-icons/fa";

import MenuItems from "./components/MenuItems.jsx";
import Cart from "./components/Cart";
import AvailableItems from "./components/AvailableItems";
import OrdersPage from "./components/OrdersPage";
import { useCart } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext.jsx";
import Login from "./components/Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LogoutButton from "./components/LogoutButton.jsx";
import "./App.css";

export const EditModeContext = createContext();

/* ---------------- Layout Wrapper ---------------- */
function AppLayout() {
  const [editMode, setEditMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const { cart } = useCart();

  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  return (
    <>
      {/* ---------------- MOBILE NAVBAR ---------------- */}
      {!isLoginPage && (
        <Navbar bg="light" expand={false} className="mobile-navbar d-md-none">
          <Navbar.Brand>
            <Button variant="link" onClick={toggleSidebar}>
              <FaBars />
            </Button>
          </Navbar.Brand>

          <Navbar.Brand>🍽️ CRM Foods</Navbar.Brand>

          <div className="d-flex align-items-center">
            <Link to="/cart" className="position-relative me-3">
              <FaShoppingCart className="fs-4" />
              {cart.length > 0 && (
                <Badge
                  bg="danger"
                  className="position-absolute top-0 start-100 translate-middle rounded-pill"
                >
                  {cart.length}
                </Badge>
              )}
            </Link>
            {/* Mobile Logout */}
            <LogoutButton />
          </div>
        </Navbar>
      )}

      <div className="d-flex">
        {/* ---------------- SIDEBAR ---------------- */}
        {!isLoginPage && (
          <div className={`sidebar ${showSidebar ? "active" : ""}`}>
            <Nav className="flex-column p-3 h-100">
              <Nav.Item className="mb-4">
                <h4>🍽️ CRM Foods</h4>
              </Nav.Item>

              <Nav.Item className="mb-3">
                <Link to="/" className="nav-link" onClick={toggleSidebar}>
                  <FaHome className="me-2" /> Menu
                </Link>
              </Nav.Item>

              <Nav.Item className="mb-3">
                <Link to="/cart" className="nav-link" onClick={toggleSidebar}>
                  <FaShoppingCart className="me-2" /> Cart ({cart.length})
                </Link>
              </Nav.Item>

              <Nav.Item className="mb-3">
                <Link
                  to="/available-items"
                  className="nav-link"
                  onClick={toggleSidebar}
                >
                  <FaBox className="me-2" /> Available Items
                </Link>
              </Nav.Item>

              <Nav.Item className="mb-3">
                <Link to="/orders" className="nav-link" onClick={toggleSidebar}>
                  <FaHistory className="me-2" /> Orders
                </Link>
              </Nav.Item>

              {/* -------- EDIT MODE SWITCH -------- */}
              <Nav.Item className="mt-4 mb-3">
                <div className="d-flex align-items-center">
                  <span className="me-2">
                    {editMode ? <FaEdit /> : <FaShoppingCart />}
                  </span>
                  <Switch
                    onChange={() => setEditMode(!editMode)}
                    checked={editMode}
                    onColor="#0d6efd"
                    offColor="#6c757d"
                    checkedIcon={false}
                    uncheckedIcon={false}
                    height={20}
                    width={48}
                  />
                  <span className="ms-2">
                    {editMode ? "Edit Mode" : "View Mode"}
                  </span>
                </div>
              </Nav.Item>

              {/* -------- LOGOUT (DESKTOP + MOBILE SIDEBAR) -------- */}
              <Nav.Item className="mt-auto pt-4 border-top">
                <div className="nav-link d-flex align-items-center">
                  <FaSignOutAlt className="me-2" />
                  <LogoutButton />
                </div>
              </Nav.Item>
            </Nav>
          </div>
        )}

        {/* ---------------- MAIN CONTENT ---------------- */}
        <EditModeContext.Provider value={{ editMode, setEditMode }}>
          <div className="main-content w-100">
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Routes>
                      <Route path="/" element={<MenuItems />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route
                        path="/available-items"
                        element={<AvailableItems />}
                      />
                      <Route path="/orders" element={<OrdersPage />} />
                    </Routes>

                    <MenuItems.AddButton />
                    <MenuItems.Modal />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </EditModeContext.Provider>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

/* ---------------- ROOT APP ---------------- */
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}
