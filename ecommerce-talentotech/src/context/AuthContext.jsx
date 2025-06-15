import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import Loader from "../components/loader/Loader";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Estado de carga inicial
  const auth = getAuth();

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación de Firebase
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Si hay un usuario autenticado, obtener sus claims
          const tokenResult = await firebaseUser.getIdTokenResult(true);
          const role = tokenResult.claims.role || "cliente"; // valor por defecto
          const nombre =
            firebaseUser.email?.split("@")[0] ||
            firebaseUser.displayName ||
            "Usuario";

          // Actualizar el estado del usuario
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            nombre,
            role,
          });
        } catch (error) {
          console.error("Error al obtener claims del usuario:", error);
          // Si hay error obteniendo claims, guardamos info básica
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            nombre: firebaseUser.email?.split("@")[0] || "Usuario",
            role: "cliente",
          });
        }
      } else {
        // No hay usuario autenticado
        setUser(null);
      }

      // Terminar el estado de carga
      setLoading(false);
    });

    // Cleanup del listener cuando el componente se desmonte
    return () => unsubscribe();
  }, [auth]);

  // Función para login manual (mantiene tu funcionalidad actual)
  const login = (userObj) => {
    setUser(userObj);
  };

  // Función para logout
  const logout = async () => {
    try {
      await signOut(auth); // Cerrar sesión en Firebase
      setUser(null); // Limpiar el estado local
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Mientras está cargando, mostrar un estado de carga
  if (loading) {
    return (
      <div className="loader-container">
        <Loader />
        <p>Verificando sesión...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
