// src/pages/Register/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Register.scss";

const Register = () => {
  const { login } = useAuth(); // simulamos login tras registro
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "cliente", // predeterminado
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { nombre, email, password } = formData;

    if (!nombre || !email || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    // Simulamos registro exitoso y login automático
    login({ nombre, rol: formData.rol });
    navigate("/profile");
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Crear una cuenta</h2>

        {error && <p className="error-message">{error}</p>}

        <input
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          value={formData.nombre}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
        />

        {/* Podrías dejar visible este select solo si es para pruebas */}
        {/* 
        <select name="rol" value={formData.rol} onChange={handleChange}>
          <option value="cliente">Cliente</option>
          <option value="admin">Admin</option>
        </select>
        */}

        <button type="submit">Registrarse</button>

        <div className="login-redirect">
          ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
