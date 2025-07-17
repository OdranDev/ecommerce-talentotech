import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { CartContext } from "../../../context/CartContext.jsx";
import { toast } from "react-toastify";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../auth/Firebase.js";
import useUser from "../../../hooks/useUser.js";
import "./ProductDetail.scss";
import { useProducts } from "../../../context/ProductsContext.jsx";

function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(null);
  const [error, setError] = useState(null);

  const { user, role, loading: userLoading } = useUser();
  const { addVotedProduct } = useProducts();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProducto({ ...data, id });
          if (user && data.ratings && data.ratings[user.uid]) {
            setUserRating(data.ratings[user.uid]);
          }
        } else {
          setError("Producto no encontrado");
          toast.error("Producto no encontrado.");
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar el producto");
        toast.error("Error al obtener producto.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, user]);

  const handleAddToCart = () => {
    if (producto.stock <= 0) {
      toast.error("Producto sin stock disponible");
      return;
    }
    
    addToCart({ ...producto, id });
    toast.success("Producto agregado al carrito 🛒");
  };

  const handleRating = async (ratingValue) => {
    if (!user) {
      toast.error("Debes iniciar sesión para calificar.");
      return;
    }

    try {
      const docRef = doc(db, "products", id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return;

      const data = docSnap.data();
      const ratings = data.ratings || {};
      ratings[user.uid] = ratingValue;

      const ratingValues = Object.values(ratings);
      const newAverage =
        ratingValues.reduce((sum, r) => sum + r, 0) / ratingValues.length;

      await updateDoc(docRef, {
        ratings,
        rating: {
          average: newAverage,
          count: ratingValues.length,
        },
      });

      setProducto((prev) => ({
        ...prev,
        ratings,
        rating: {
          average: newAverage,
          count: ratingValues.length,
        },
      }));

      setUserRating(ratingValue);
      addVotedProduct({ ...producto, id }, ratingValue);
      toast.success("Gracias por tu calificación ⭐");
    } catch (err) {
      console.error(err);
      toast.error("Error al registrar tu calificación.");
    }
  };

  const getStockStatus = (stock) => {
    if (stock <= 0) return { class: 'out-of-stock', text: 'Sin stock' };
    if (stock <= 5) return { class: 'low-stock', text: `Quedan ${stock} unidades` };
    return { class: 'in-stock', text: `${stock} disponibles` };
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    
    if (hasHalfStar) {
      stars.push('☆');
    }
    
    return stars.join('');
  };

  if (loading || userLoading) {
    return (
      <div className="product-detail-container loading">
        <div className="product-detail-image">
          <div className="loading-placeholder"></div>
        </div>
        <div className="product-detail-info">
          <p>Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="product-detail-container error">
        <div className="error-message">
          <h2>❌ {error || "Producto no encontrado"}</h2>
          <Link to="/products" className="btn-primary">
            Volver a productos
          </Link>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(producto.stock);

  return (
    <div className="product-detail-container">
      <div className="product-detail-image">
        <img 
          src={producto.image} 
          alt={producto.title}
          loading="lazy"
        />
      </div>

      <div className="product-detail-info">
        <h2>{producto.title}</h2>

        <div className="product-meta">
          <div className="meta-item">
            <span className="label">Precio</span>
            <span className="value price">${producto.price}</span>
          </div>
          
          <div className="meta-item">
            <span className="label">Categoría</span>
            <span className="value category">{producto.category}</span>
          </div>
          
          <div className="meta-item">
            <span className="label">Stock</span>
            <span className={`value stock ${stockStatus.class}`}>
              {stockStatus.text}
            </span>
          </div>
        </div>

        <div className="description">
          <strong>Descripción:</strong> {producto.description}
        </div>

        <div className="rating-section">
          <div className="current-rating">
            <span className="stars">
              {producto.rating?.average 
                ? renderStars(producto.rating.average) 
                : "☆☆☆☆☆"
              }
            </span>
            <span className="rating-value">
              {producto.rating?.average
                ? `${producto.rating.average.toFixed(1)}`
                : "Sin calificaciones"}
            </span>
            {producto.rating?.count > 0 && (
              <span className="rating-count">
                ({producto.rating.count} {producto.rating.count === 1 ? 'calificación' : 'calificaciones'})
              </span>
            )}
          </div>

          {role === "user" && (
            <div className="rating-input">
              <span className="rating-label">Tu calificación:</span>
              <div className="stars-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= (userRating || 0) ? 'active' : ''}`}
                    onClick={() => handleRating(star)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Calificar con ${star} estrella${star > 1 ? 's' : ''}`}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleRating(star);
                      }
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="button-group">
          <Link to="/products" className="btn-primary">
            ← Ver productos
          </Link>
          <button 
            className="btn-secondary" 
            onClick={handleAddToCart}
            disabled={producto.stock <= 0}
          >
            🛒 Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;