// src/routes/PublicRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/loader/Loader";

const PublicRoute = ({ children }) => {
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

  // Si ya hay un usuario autenticado, redirigir según su rol
  if (user) {
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/products" replace />;
  }

  // Si no hay usuario, mostrar la página pública (login/register)
  return children;
};

export default PublicRoute;
