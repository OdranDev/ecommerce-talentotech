// src/components/RequireAdmin.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "../../auth/Firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const RequireAdmin = ({ children }) => {
  const [status, setStatus] = useState("loading");
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAuthorized(false);
        setStatus("done");
        return;
      }

      try {
        // Verificar si ya existe algún admin
        const snapshot = await getDocs(collection(db, "usuarios"));
        const admins = snapshot.docs.filter((doc) => doc.data().role === "admin");

        if (admins.length === 0) {
          // No hay admins registrados, permitir acceso al primero
          setIsAuthorized(true);
        } else {
          // Validar si el usuario actual es admin
          const userRef = doc(db, "usuarios", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setIsAuthorized(userData.role === "admin");
          } else {
            setIsAuthorized(false);
          }
        }
      } catch (err) {
        console.error("Error al verificar el rol:", err);
        setIsAuthorized(false);
      } finally {
        setStatus("done");
      }
    });

    return () => unsubscribe();
  }, []);

  if (status === "loading") return <p>Cargando permisos...</p>;
  if (!isAuthorized) return <Navigate to="/unauthorized" replace />;
  return children;
};

export default RequireAdmin;
