import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import GlobalProvider from "./context/GlobalContext.jsx";
import CartProvider from "./context/CartContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ProductsProvider } from "./context/ProductsContext";
import './main.scss';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GlobalProvider>
      <BrowserRouter>
        <ProductsProvider>
          <AuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AuthProvider>
        </ProductsProvider>
      </BrowserRouter>
    </GlobalProvider>
  </React.StrictMode>
);
