// src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/loader/Loader";

const ProtectedRoute = ({ children, rolesPermitidos = [] }) => {
  const { user, loading } = useAuth();

  // Si está cargando, mostrar Loader
  if (loading) {
    return (
      <div className="loader-container">
        <Loader />
        <p>Verificando sesión...</p>
      </div>
    );
  }

  // Si no hay usuario, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si se especifican roles y el usuario no tiene el rol requerido
  if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Si todo está bien, mostrar el componente hijo
  return children;
};

export default ProtectedRoute;
