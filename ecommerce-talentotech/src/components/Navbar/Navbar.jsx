import React, { useState } from "react";
import { GlobalContext } from "../../context/GlobalContext";
import { CartContext } from "../../context/CartContext";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaBox,
  FaEnvelope,
  FaShoppingBag,
  FaUser,
  FaBars,
  FaTimes,
  FaRegUser,
} from "react-icons/fa";
import "./Navbar.scss";
import { useContext } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { titulo } = useContext(GlobalContext);
  const { cartItems } = useContext(CartContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const { user, role, logout } = useAuth();

  return (
    <header>
      <nav className="navbar">
        <h1 className="navbar-title">{titulo}</h1>

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
              <FaBox />
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
              <FaShoppingBag />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              <span className="nav-text">Cart</span>
            </NavLink>
          </li>
          {user ? (
            <li className="user-menu">
              <NavLink
              to="/admin"
              onClick={closeMenu}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <FaUser />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              <span className="nav-text">Cart</span>
            </NavLink>
              <div className="user-dropdown">
                <span className="nav-text">{user.email}</span>
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
                    <button
                      onClick={() => {
                        logout();
                        closeMenu();
                      }}
                    >
                      Cerrar sesión
                    </button>
                  </li>
                </ul>
              </div>
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
  );
}
