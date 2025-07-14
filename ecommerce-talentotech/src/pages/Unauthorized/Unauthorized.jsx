import React from "react";
import { Link } from "react-router-dom";
import { MdBlock, MdHome, MdArrowBack } from "react-icons/md";
import './Unauthorized.scss'

const Unauthorized = () => {
  return (
    <div className="unauthorized">
      <div className="unauthorized__container">
        <div className="unauthorized__icon">
          <MdBlock />
        </div>
        
        <div className="unauthorized__content">
          <h1 className="unauthorized__title">Acceso Denegado</h1>
          <p className="unauthorized__message">
            No tienes los permisos necesarios para acceder a esta página.
          </p>
          <p className="unauthorized__submessage">
            Si crees que esto es un error, contacta al administrador del sistema.
          </p>
        </div>
        
        <div className="unauthorized__actions">
          <Link to="/" className="unauthorized__button unauthorized__button--primary">
            <MdHome />
            <span>Volver al inicio</span>
          </Link>
          
          <button 
            onClick={() => window.history.back()} 
            className="unauthorized__button unauthorized__button--secondary"
          >
            <MdArrowBack />
            <span>Página anterior</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
