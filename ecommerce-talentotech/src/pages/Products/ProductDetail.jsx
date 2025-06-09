import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { CartContext } from "../../context/CartContext.jsx";
import { toast } from "react-toastify";
import "./ProductDetail.scss";

function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCargando(true);
    fetch(`https://fakestoreapi.com/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener el producto.");
        return res.json();
      })
      .then((data) => {
        setProducto(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudo cargar el producto.");
        setCargando(false);
      });
  }, [id]);

  if (cargando) return <p>Cargando producto...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!producto) return <p>Producto no encontrado.</p>;

  const handleAddToCart = () => {
    addToCart(producto);
    toast.success("Producto agregado al carrito 🛒");
  };

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
        <p><strong>Rating:</strong> {producto.rating?.rate} ⭐ ({producto.rating?.count} reseñas)</p>

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

