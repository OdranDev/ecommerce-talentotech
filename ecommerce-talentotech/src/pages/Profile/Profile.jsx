// /src/pages/Profile/Profile.jsx
import React from "react";

export default function Profile() {
  return (
    <div>
      <h2>Perfil del usuario</h2>
      <p>Esta es una ruta protegida.</p>
      <button onClick={() => localStorage.setItem("auth", "true")}>
        Iniciar sesión
      </button>
      <button onClick={() => localStorage.removeItem("auth")}>
        Cerrar sesión
      </button>
    </div>
  );
}
