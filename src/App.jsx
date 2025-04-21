import React, { createContext, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button, Badge } from "react-bootstrap";
import { motion } from "framer-motion";
import Switch from "react-switch";
import { FaEdit, FaShoppingCart } from "react-icons/fa";
import MenuItems from "./components/MenuItems.jsx";
import Cart from "./components/Cart";
import AvailableItems from "./components/AvailableItems";
import { useCart } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext.jsx";
import Login from "./components/Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LogoutButton from "./components/LogoutButton.jsx";

export const EditModeContext = createContext();

export default function App() {
  const [editMode, setEditMode] = useState(false);
  const { cart } = useCart();

  return (
    <AuthProvider>
      <EditModeContext.Provider value={{ editMode, setEditMode }}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="container my-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="d-flex align-items-center"
                      >
                        <Link to="/available-items">
                          <Button variant="info">Available Items</Button>
                        </Link>
                        <Link
                          style={{
                            textDecoration: "none",
                            color: "black",
                          }}
                          to={"/"}
                        >
                          <p
                            style={{
                              margin: 0,
                              padding: 0,
                              paddingLeft: "20px",
                            }}
                          >
                            🍽 Menu Items
                          </p>
                        </Link>
                        <Badge bg="info" className="ms-2">
                          <MenuItems.Count />
                        </Badge>
                      </motion.h2>

                      <div className="d-flex align-items-center">
                        <div className="me-3 d-flex align-items-center">
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

                        <Link to="/cart">
                          <Button
                            variant="info"
                            className="position-relative me-2"
                          >
                            Cart
                            {cart.length > 0 && (
                              <Badge
                                bg="danger"
                                className="position-absolute top-0 start-100 translate-middle rounded-pill"
                              >
                                {cart.length}
                              </Badge>
                            )}
                          </Button>
                        </Link>
                        <LogoutButton />
                      </div>
                    </div>

                    <Routes>
                      <Route path="/" element={<MenuItems />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route
                        path="/available-items"
                        element={<AvailableItems />}
                      />
                    </Routes>

                    <MenuItems.AddButton />
                    <MenuItems.Modal />
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
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
