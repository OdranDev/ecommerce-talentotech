// src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../auth/Firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext();


const useAuth = () => {
  return useContext(AuthContext);
};


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  
  const register = async (email, password, userData = {}) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    
    
    await setDoc(doc(db, "users", res.user.uid), {
      email,
      role: "user", // rol por defecto
      fullName: userData.fullName || "",
      comment: userData.comment || "",
      createdAt: serverTimestamp(),
      ...userData 
    });

    return res;
  };

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  const getUserRole = async (uid) => {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data().role : null;
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const role = await getUserRole(currentUser.uid);
        setUser({ uid: currentUser.uid, email: currentUser.email });
        setRole(role);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, register, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 🔹 Exportaciones como default y named exports
export default AuthProvider;
export { useAuth };