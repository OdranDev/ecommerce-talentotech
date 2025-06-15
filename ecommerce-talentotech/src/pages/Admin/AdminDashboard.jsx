// src/pages/Admin/AdminDashboard.jsx
import React from "react";
import "./AdminDashboard.scss";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="admin-dashboard">
      <h2>Panel de Administración</h2>
      <p>Bienvenido, {user?.nombre} 👋</p>

      <div className="admin-cards">
        <div className="admin-card">
          <h3>Usuarios</h3>
          <p>Ver y gestionar todos los usuarios registrados.</p>
          <button>Ir a Usuarios</button>
        </div>
        <div className="admin-card">
          <h3>Productos</h3>
          <p>Agregar, editar o eliminar productos.</p>
          <button>Ir a Productos</button>
        </div>
        <div className="admin-card">
          <h3>Órdenes</h3>
          <p>Revisar pedidos de los clientes.</p>
          <button>Ver Órdenes</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
