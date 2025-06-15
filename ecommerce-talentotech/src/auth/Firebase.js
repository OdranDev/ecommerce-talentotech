// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBS8goBTfY3jUT_x08AVB3F5h7L7M0brsQ",
  authDomain: "ecommerce-talentotech.firebaseapp.com",
  projectId: "ecommerce-talentotech",
  storageBucket: "ecommerce-talentotech.firebasestorage.app",
  messagingSenderId: "962389753420",
  appId: "1:962389753420:web:741408a20d3b3b805f7ee9",
  measurementId: "G-CJ7NNGTPR7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth();

export function createUser(email, password) {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up
      console.log("Credenciales:" + userCredential);
      const user = userCredential.user;
      console.log(user);
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // ..
    });
}
