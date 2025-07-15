import React, { useContext } from "react";
import { useAuth } from "../../context/AuthContext";
import { ProductsContext } from "../../context/ProductsContext"; // Asegúrate de tener este contexto creado
import "./Profile.scss";

export default function Profile() {
  const { user } = useAuth();
  const { votedProducts } = useContext(ProductsContext);

  return (
    <div className="profile-container">
      <h2>Mi Perfil</h2>
      <div className="user-info">
        <p><strong>Nombre completo:</strong> {user.fullName}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Rol:</strong> {user.role}</p>
      </div>

      <section className="favorites-section">
        <h3>⭐ Productos Favoritos</h3>
        {votedProducts && votedProducts.length > 0 ? (
          <div className="favorites-grid">
            {votedProducts.map((product) => (
              <div className="product-card" key={product.id}>
                <img src={product.image} alt={product.title} />
                <h4>{product.title}</h4>
                <p className="rating">Clasificación: {product.rating} ⭐</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Aún no has calificado productos.</p>
        )}
      </section>
    </div>
  );
}
