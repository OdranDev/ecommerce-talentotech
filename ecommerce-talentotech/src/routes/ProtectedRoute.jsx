// src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ rolesPermitidos, children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (!rolesPermitidos.includes(user.rol)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
