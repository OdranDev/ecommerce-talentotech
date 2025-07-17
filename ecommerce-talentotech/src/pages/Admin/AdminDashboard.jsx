// src/pages/Admin/AdminDashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
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
          <Link to="/admin/users">
            <button>Ir a usuarios</button>
          </Link>
        </div>

        <div className="admin-card">
          <h3>Productos</h3>
          <p>Agregar, editar o eliminar productos.</p>
          <Link to="/admin/products">
            <button>Ir a Productos</button>
          </Link>
        </div>

        <div className="admin-card">
          <h3>Órdenes</h3>
          <p>Revisar pedidos de los clientes.</p>
          <Link to="/admin/ordenes">
            <button className="construccion">
              Ver Órdenes
              <span className="tooltip-text">Página en construcción</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

// import { useNavigate, Link } from 'react-router-dom';

// function AdminDashboard() {
//   // const { logout } = useAuth();
//   // const navigate = useNavigate();

//   // const handleLogout = async () => {
//   //   await logout();
//   //   navigate('/');
//   // };

//   return (
//     <div>
//       <h1>Panel de Administración</h1>
//       <div className="admin-dashboard">
//         <h2>Panel de Administración</h2>
//         <p>Bienvenido, {user?.nombre} 👋</p>

//         <div className="admin-cards">
//           <div className="admin-card">
//             <h3>Usuarios</h3>
//             <p>Ver y gestionar todos los usuarios registrados.</p>
//           </div>
//           <div className="admin-card">
//             <h3>Productos</h3>
//             <p>Agregar, editar o eliminar productos.</p>
//             <button>Ir a Productos</button>
//           </div>
//           <div className="admin-card">
//             <h3>Órdenes</h3>
//             <p>Revisar pedidos de los clientes.</p>
//             <button>Ver Órdenes</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AdminDashboard;
