// src/pages/Login/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.scss";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === "admin@demo.com" && password === "admin123") {
      login({ nombre: "Admin", rol: "admin" });
      navigate("/admin");
    } else if (email === "cliente@demo.com" && password === "cliente123") {
      login({ nombre: "Cliente", rol: "cliente" });
      navigate("/profile");
    } else {
      setError("Credenciales inválidas");
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar sesión</h2>

      {error && <p className="error-msg">{error}</p>}

      <form onSubmit={handleSubmit} className="login-form">
        <label>
          Correo electrónico:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Contraseña:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit">Iniciar sesión</button>
      </form>

      <div className="demo-info">
        <p><strong>Admin:</strong> admin@demo.com / admin123</p>
        <p><strong>Cliente:</strong> cliente@demo.com / cliente123</p>
      </div>

      <div className="register-redirect">
        ¿No tienes una cuenta? <Link to="/register">Regístrate</Link>
      </div>
    </div>
  );
};

export default Login;
