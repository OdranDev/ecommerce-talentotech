import React, { useState, useRef, useEffect, useContext } from "react";
import { GlobalContext } from "../../context/GlobalContext";
import { CartContext } from "../../context/CartContext";
import { NavLink } from "react-router-dom";
import { FaHome, FaEnvelope, FaUser, FaBars, FaTimes } from "react-icons/fa";
import { RiShoppingCartFill } from "react-icons/ri";
import { AiTwotoneShop } from "react-icons/ai";
import { useAuth } from "../../context/AuthContext";
import { Helmet } from "react-helmet-async";

import "./Navbar.scss";

export default function Navbar() {
  const { titulo } = useContext(GlobalContext);
  const { cartItems } = useContext(CartContext);
  const { user, role, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
    // Agregar/quitar clase al body para controlar el scroll
    if (!menuOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
    document.body.classList.remove("menu-open");
  };

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const closeDropdown = () => setDropdownOpen(false);

  const dropdownRef = useRef(null);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMenuOpen(false);
        setDropdownOpen(false);
        document.body.classList.remove("menu-open");
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Limpiar clase del body al desmontar el componente
  useEffect(() => {
    return () => {
      document.body.classList.remove("menu-open");
    };
  }, []);

  const handleLogout = () => {
    logout();
    closeMenu();
    closeDropdown();
  };

  return (
    <>
      <Helmet>
        <title>{titulo} | Navegación</title>
        <meta
          name="description"
          content="Barra de navegación del sitio, accede a productos, contacto, carrito y cuenta de usuario."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={`${titulo} | Navegación`} />
        <meta
          property="og:description"
          content="Explora productos, contacta con nosotros y gestiona tu cuenta desde la barra de navegación."
        />
      </Helmet>
      {/* Overlay para cerrar el menú */}
      <div
        className={`menu-overlay ${menuOpen ? "show" : ""}`}
        onClick={closeMenu}
      />

      <header>
        <nav className="navbar">
          <NavLink to="/">
            <h1 className="navbar-title">{titulo}</h1>
          </NavLink>

          <button className="menu-toggle" onClick={toggleMenu}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>

          <ul className={`nav-actions ${menuOpen ? "open" : ""}`}>
            <li>
              <NavLink
                to="/"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <FaHome />
                <span className="nav-text">Home</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/products"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <AiTwotoneShop />
                <span className="nav-text">Products</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <FaEnvelope />
                <span className="nav-text">Contact</span>
              </NavLink>
            </li>
            <li className="cart-icon">
              <NavLink
                to="/cart"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <RiShoppingCartFill />
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
                <span className="nav-text">Cart</span>
              </NavLink>
            </li>

            {user ? (
              <li className="user-menu" ref={dropdownRef}>
                <button className="user-btn" onClick={toggleDropdown}>
                  <FaUser />
                  <span className="nav-text">Usuario</span>
                </button>
                {dropdownOpen && (
                  <div className="user-dropdown">
                    <span className="nav-text user-email">{user.email}</span>
                    <ul className="dropdown">
                      {role === "admin" ? (
                        <li>
                          <NavLink to="/admin" onClick={closeMenu}>
                            Admin
                          </NavLink>
                        </li>
                      ) : (
                        <li>
                          <NavLink to="/profile" onClick={closeMenu}>
                            Perfil
                          </NavLink>
                        </li>
                      )}
                      <li>
                        <button onClick={handleLogout}>Cerrar sesión</button>
                      </li>
                    </ul>
                  </div>
                )}
              </li>
            ) : (
              <li>
                <NavLink
                  to="/login"
                  onClick={closeMenu}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <FaUser />
                  <span className="nav-text">Login</span>
                </NavLink>
              </li>
            )}
          </ul>
        </nav>
      </header>
    </>
  );
}
