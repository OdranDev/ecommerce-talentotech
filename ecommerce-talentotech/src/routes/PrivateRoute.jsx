import React from 'react';
import { Navigate } from 'react-router-dom';

// Simulación simple de autenticación
const isAuthenticated = () => {
  return localStorage.getItem('auth') === 'true';
};

export default function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/" />;
}
