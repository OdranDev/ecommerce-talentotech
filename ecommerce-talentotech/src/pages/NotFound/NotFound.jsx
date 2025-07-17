import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaShoppingCart,
  FaStore,
  FaPhone,
  FaStar,
  FaSpinner,
  FaArrowLeft,
  FaEnvelope,
} from "react-icons/fa";
import { MdErrorOutline } from "react-icons/md";
import "./NotFound.scss";

function NotFound() {
  const [countdown, setCountdown] = useState(60);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsRedirecting(true);
          setTimeout(() => navigate("/"), 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoHome = () => {
    setIsRedirecting(true);
    setTimeout(() => navigate("/"), 300);
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const suggestions = [
    { path: "/", label: "Inicio", icon: <FaHome /> },
    { path: "/products", label: "Productos", icon: <FaStore /> },
    { path: "/cart", label: "Carrito", icon: <FaShoppingCart /> },
    { path: "/contact", label: "Contacto", icon: <FaPhone /> },
  ];

  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <div className="error-illustration">
          <div className="error-number">
            <span className="digit">4</span>
            <span className="digit zero">0</span>
            <span className="digit">4</span>
          </div>
          <div className="floating-elements">
            <div className="element element-1"><FaStar /></div>
            <div className="element element-2"><FaStar /></div>
            <div className="element element-3"><FaStar /></div>
            <div className="element element-4"><FaStar /></div>
          </div>
        </div>

        <div className="error-message">
          <h1><MdErrorOutline /> ¡Oops! Página no encontrada</h1>
          <p className="error-description">
            Parece que la página que buscas ha desaparecido en el espacio digital.
            No te preocupes, te ayudamos a encontrar el camino de regreso.
          </p>
        </div>

        <div className="action-buttons">
          <button
            className="btn-primary"
            onClick={handleGoHome}
            disabled={isRedirecting}
          >
            {isRedirecting ? <><FaSpinner className="spin" /> Redirigiendo...</> : <><FaHome /> Inicio</>}
          </button>

          <div className="redirect-info">
            <p>
              {isRedirecting ? (
                <span className="redirecting">
                  <FaSpinner className="spin" /> Redirigiendo al inicio...
                </span>
              ) : (
                <>
                  Serás redirigido al inicio en{" "}
                  <span className="countdown">{countdown}</span> segundos
                </>
              )}
            </p>
          </div>

          <button
            className="btn-secondary"
            onClick={handleGoBack}
            disabled={isRedirecting}
          >
            <FaArrowLeft /> Atrás
          </button>
        </div>

        <div className="error-details">
          <div className="error-code">
            <span className="label">Código de error:</span>
            <span className="code">404 - Not Found</span>
          </div>
          <div className="possible-causes">
            <h3>Posibles causas:</h3>
            <ul>
              <li>La URL fue escrita incorrectamente</li>
              <li>La página fue movida o eliminada</li>
              <li>El enlace está desactualizado</li>
            </ul>
          </div>
        </div>

        <div className="suggestions">
          <h3>¿Buscabas alguna de estas páginas?</h3>
          <div className="suggestions-grid">
            {suggestions.map((suggestion, index) => (
              <Link
                key={index}
                to={suggestion.path}
                className="suggestion-card"
              >
                <span className="suggestion-icon">{suggestion.icon}</span>
                <span className="suggestion-label">{suggestion.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="help-section">
          <div className="help-card">
            <h4>¿Necesitas ayuda?</h4>
            <p>
              Si crees que esto es un error, puedes contactarnos y te ayudaremos
              a resolver el problema.
            </p>
            <div className="contact-options">
              <a href="mailto:support@example.com" className="contact-link">
                <FaEnvelope /> Enviar email
              </a>
              <a href="tel:+1234567890" className="contact-link">
                <FaPhone /> Llamar
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;

