// src/components/LogoutButton.js
import React from "react";
import { Button } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaSignOutAlt } from "react-icons/fa";

export default function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Failed to logout: " + error.message);
    }
  }

  return (
    <Button variant="danger" onClick={handleLogout}>
      <FaSignOutAlt className="me-1" /> Logout
    </Button>
  );
}
