// src/auth/Firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBS8goBTfY3jUT_x08AVB3F5h7L7M0brsQ",
  authDomain: "ecommerce-talentotech.firebaseapp.com",
  projectId: "ecommerce-talentotech",
  storageBucket: "ecommerce-talentotech.appspot.com", // Corregido (debería ser .appspot.com)
  messagingSenderId: "962389753420",
  appId: "1:962389753420:web:741408a20d3b3b805f7ee9",
  measurementId: "G-CJ7NNGTPR7",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Crear nuevo usuario
export const createUser = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

// Iniciar sesión
export const loginUser = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// Exportar auth si se necesita en otros contextos
export { auth };
