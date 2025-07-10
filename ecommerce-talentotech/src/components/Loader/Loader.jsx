import React from 'react';
import './Loader.scss';

const Loader = ({
  size = 'large',
  variant = 'primary',
  text = 'Cargando...',
  className = '',
  overlay = false,
  overlayDark = false,
  'aria-label': ariaLabel = 'Cargando contenido'
}) => {
  const loaderContent = (
    <div 
      className={`cart-loader-container ${size} ${variant} ${className}`}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      <div className="cart-loader">
        <div className="cart">
          <div className="cart-handle"></div>
          <div className="cart-wheel cart-wheel-left"></div>
          <div className="cart-wheel cart-wheel-right"></div>
        </div>
        <div className="cart-items">
          <div className="item item-1"></div>
          <div className="item item-2"></div>
          <div className="item item-3"></div>
        </div>
      </div>
      {text && (
        <p className="cart-loader-text">
          {text}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className={`cart-loader-overlay ${overlayDark ? 'dark' : ''}`}>
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};

export default Loader;