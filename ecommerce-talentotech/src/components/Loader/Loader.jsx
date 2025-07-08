// // src/components/Loader.jsx
// import React from "react";
// import "./Loader.scss";

// export default function Loader() {
//   return (
//     <div className="loader-container">
//       <span className="loader"></span>
//     </div>
//   );
// }

// CartLoader.jsx
import React from 'react';
import './Loader.scss';

const CartLoader = ({ 
  size = 'large', 
  color = '#007bff', 
  className = '',
  text = 'Cargando...' 
}) => {
  return (
    <div className={`cart-loader-container ${size} ${className}`}>
      <div className="cart-loader">
        <div className="cart" style={{ borderColor: color }}>
          <div className="cart-handle" style={{ borderColor: color }}></div>
          <div className="cart-wheel cart-wheel-left" style={{ backgroundColor: color }}></div>
          <div className="cart-wheel cart-wheel-right" style={{ backgroundColor: color }}></div>
        </div>
        <div className="cart-items">
          <div className="item item-1" style={{ backgroundColor: color }}></div>
          <div className="item item-2" style={{ backgroundColor: color }}></div>
          <div className="item item-3" style={{ backgroundColor: color }}></div>
        </div>
      </div>
      {text && <p className="cart-loader-text" style={{ color }}>{text}</p>}
    </div>
  );
};

export default CartLoader;

// Ejemplo de uso:
// <CartLoader size="large" color="#e74c3c" text="Procesando compra..." />
// <CartLoader size="small" color="#2ecc71" />
// <CartLoader className="my-custom-loader" />