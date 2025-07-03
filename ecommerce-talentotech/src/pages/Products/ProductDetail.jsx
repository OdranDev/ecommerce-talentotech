import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { CartContext } from "../../context/CartContext.jsx";
import { toast } from "react-toastify";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../auth/Firebase";
import useUser from "../../hooks/useUser";
import "./ProductDetail.scss";
import { useProducts } from "../../context/ProductsContext";

function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(null);

  const { user, role, loading: userLoading } = useUser();
  const { addVotedProduct } = useProducts();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProducto({ ...data, id }); // Agregamos el id al objeto
          if (user && data.ratings && data.ratings[user.uid]) {
            setUserRating(data.ratings[user.uid]);
          }
        } else {
          toast.error("Producto no encontrado.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error al obtener producto.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, user]);

  const handleAddToCart = () => {
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

      // 💾 Guardar en productos favoritos del usuario (votados)
      addVotedProduct({ ...producto, id }, ratingValue);

      toast.success("Gracias por tu calificación ⭐");
    } catch (err) {
      console.error(err);
      toast.error("Error al registrar tu calificación.");
    }
  };

  if (loading || userLoading) return <p>Cargando producto...</p>;
  if (!producto) return <p>Producto no encontrado.</p>;

  return (
    <div className="product-detail-container">
      <div className="product-detail-image">
        <img src={producto.image} alt={producto.title} />
      </div>

      <div className="product-detail-info">
        <h2>{producto.title}</h2>
        <p><strong>Precio:</strong> ${producto.price}</p>
        <p><strong>Descripción:</strong> {producto.description}</p>
        <p><strong>Categoría:</strong> {producto.category}</p>
        <p>
          <strong>Rating:</strong>{" "}
          {producto.rating?.average
            ? `${producto.rating.average.toFixed(1)} ⭐ (${producto.rating.count})`
            : "Sin calificaciones"}
        </p>

        {role === "user" && (
          <div className="rating-input">
            <p><strong>Tu calificación:</strong></p>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                style={{
                  fontSize: "1.8rem",
                  color: star <= (userRating || 0) ? "#ffc107" : "#ccc",
                  cursor: "pointer",
                }}
                onClick={() => handleRating(star)}
              >
                ★
              </span>
            ))}
          </div>
        )}

        <div className="button-group">
          <Link to="/products">
            <button className="cta-button">Ver productos</button>
          </Link>
          <button className="btn-add-to-cart" onClick={handleAddToCart}>
            🛒 Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
