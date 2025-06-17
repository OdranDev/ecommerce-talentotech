// Firebase core
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";

// Firestore
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBS8goBTfY3jUT_x08AVB3F5h7L7M0brsQ",
  authDomain: "ecommerce-talentotech.firebaseapp.com",
  projectId: "ecommerce-talentotech",
  storageBucket: "ecommerce-talentotech.appspot.com", // corregido el domain
  messagingSenderId: "962389753420",
  appId: "1:962389753420:web:741408a20d3b3b805f7ee9",
  measurementId: "G-CJ7NNGTPR7",
};

// Inicialización Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

auth.useDeviceLanguage();

// ─────────────────────────────────────────────
// 🔐 AUTENTICACIÓN
// ─────────────────────────────────────────────

export async function createUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "usuarios", user.uid), {
      uid: user.uid,
      email: user.email,
      createdAt: serverTimestamp(),
    });

    console.log("Usuario registrado sin rol asignado.");
    return user;
  } catch (error) {
    console.error("Error de registro:", error.code, error.message);
    throw error;
  }
}

export function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function loginWithGoogle() {
  return signInWithPopup(auth, provider);
}

// ─────────────────────────────────────────────
// 🔥 FIRESTORE - PRODUCTOS
// ─────────────────────────────────────────────

export function createProduct(name, imagen, price, description) {
  return new Promise(async (res, rej) => {
    try {
      const docRef = await addDoc(collection(db, "productos"), {
        name,
        imagen,
        price,
        description,
      });
      console.log("Producto creado con ID:", docRef.id);
      res(docRef);
    } catch (e) {
      console.error("Error al agregar producto:", e);
      rej(e);
    }
  });
}

export function obtenerProductos() {
  return new Promise(async (res, rej) => {
    try {
      const querySnapshot = await getDocs(collection(db, "productos"));
      const productos = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      res(productos);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      rej(error);
    }
  });
}

// ─────────────────────────────────────────────
// 📦 EXPORTS
// ─────────────────────────────────────────────

export { auth, db };
