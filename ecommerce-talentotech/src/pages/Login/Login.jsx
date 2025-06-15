// src/pages/Login/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../auth/Firebase";
import { getAuth } from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.scss";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await loginUser(email, password);
      
      // Mostrar toast de éxito
      toast.success("✅ Inicio de sesión exitoso", { 
        autoClose: 1500,
        position: "top-right"
      });
      
      // Esperar un poco para el toast y luego obtener el rol para redirigir
      setTimeout(async () => {
        try {
          const currentUser = getAuth().currentUser;
          if (currentUser) {
            const tokenResult = await currentUser.getIdTokenResult(true);
            const role = tokenResult.claims.role;
            
            if (role === "admin") {
              navigate("/admin");
            } else {
              navigate("/products");
            }
          }
        } catch (error) {
          console.error('Error al obtener rol:', error);
          // En caso de error, redirigir a products por defecto
          navigate("/products");
        }
      }, 1500);
      
    } catch (err) {
      toast.error("❌ Credenciales incorrectas", { 
        autoClose: 3000,
        position: "top-right"
      });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <label>
          Correo electrónico:
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            disabled={isLoading}
          />
        </label>
        <label>
          Contraseña:
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            disabled={isLoading}
          />
        </label>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>
      </form>
      <div className="login-redirect">
        ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;