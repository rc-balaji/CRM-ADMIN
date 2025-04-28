import React, { createContext, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button, Badge, Navbar, Nav, Offcanvas } from "react-bootstrap";
import { motion } from "framer-motion";
import Switch from "react-switch";
import {
  FaEdit,
  FaShoppingCart,
  FaBars,
  FaHistory,
  FaBox,
  FaHome,
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

export default function App() {
  const [editMode, setEditMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const { cart } = useCart();

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  return (
    <AuthProvider>
      <EditModeContext.Provider value={{ editMode, setEditMode }}>
        <Router>
          {/* Navbar */}
          <Navbar bg="light" expand={false} className="mobile-navbar">
            <Navbar.Brand>
              <Button variant="link" onClick={toggleSidebar}>
                <FaBars />
              </Button>
            </Navbar.Brand>
            <Navbar.Brand>🍽️ CRM Foods</Navbar.Brand>
            <div className="d-flex">
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
              <LogoutButton />
            </div>
          </Navbar>

          {/* Sidebar */}
          <div className="d-flex">
            <div className={`sidebar ${showSidebar ? "active" : ""}`}>
              <Nav className="flex-column p-3">
                <Nav.Item className="mb-4">
                  <h4>🍽️ CRM Foods</h4>
                </Nav.Item>
                <Nav.Item className="mb-3">
                  <Link to="/" className="nav-link" onClick={toggleSidebar}>
                    <FaHome className="me-2" /> Menu
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
                  <Link
                    to="/orders"
                    className="nav-link"
                    onClick={toggleSidebar}
                  >
                    <FaHistory className="me-2" /> Orders
                  </Link>
                </Nav.Item>
                <Nav.Item className="mb-3">
                  <Link to="/cart" className="nav-link" onClick={toggleSidebar}>
                    <FaShoppingCart className="me-2" /> Cart ({cart.length})
                  </Link>
                </Nav.Item>
                <Nav.Item className="mt-4">
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
              </Nav>
            </div>

            {/* Main Content */}
            <div className="main-content">
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
          </div>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </Router>
      </EditModeContext.Provider>
    </AuthProvider>
  );
}
