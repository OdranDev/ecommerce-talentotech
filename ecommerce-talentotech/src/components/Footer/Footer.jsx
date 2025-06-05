import React, { useContext } from "react";
import { GlobalContext } from "../../context/GlobalContext";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";
import './Footer.scss';

function Footer() {
  const { titulo } = useContext(GlobalContext);
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section about">
          <h3>{titulo}</h3>
          <p>Tu tienda de confianza con los mejores productos tecnológicos del mercado.</p>
        </div>
        <div className="footer-section links">
          <h4>Enlaces</h4>
          <ul>
            <li><a href="/">Inicio</a></li>
            <li><a href="/products">Productos</a></li>
            <li><a href="/contact">Contacto</a></li>
          </ul>
        </div>
        <div className="footer-section social">
          <h4>Síguenos</h4>
          <div className="social-icons">
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaLinkedin /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        © {year} {titulo}. Todos los derechos reservados.
      </div>
    </footer>
  );
}

export default Footer;
