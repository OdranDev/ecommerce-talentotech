// src/pages/Register/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUser } from "../../auth/Firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Register.scss";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await createUser(email, password);
      toast.success("🎉 Registro exitoso, ahora puedes iniciar sesión", {
        position: "top-right",
        autoClose: 3000,
      });
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      console.error(err);
      setError("Hubo un error al registrarse");
      toast.error("❌ " + err.message, {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  return (
    <div className="register-container">
      <h2>Registrarse</h2>
      {error && <p className="error-msg">{error}</p>}
      <form onSubmit={handleSubmit} className="register-form">
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
        <button type="submit">Registrarse</button>
      </form>

      <div className="register-redirect">
        ¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link>
      </div>

      {/* Toast container */}
      <ToastContainer />
    </div>
  );
};

export default Register;
