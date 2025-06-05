import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function ProductDetail() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`https://fakestoreapi.com/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProducto(data);
        setCargando(false);
      })
      .catch(() => {
        setError("No se pudo cargar el producto.");
        setCargando(false);
      });
  }, [id]);

  if (cargando) return <p>Cargando producto...</p>;
  if (error) return <p>{error}</p>;
  if (!producto) return null;

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h2>{producto.title}</h2>
      <img src={producto.image} alt={producto.title} style={{ width: "200px" }} />
      <p><strong>Precio:</strong> ${producto.price}</p>
      <p><strong>Descripción:</strong> {producto.description}</p>
      <p><strong>Categoría:</strong> {producto.category}</p>
      <p><strong>Rating:</strong> {producto.rating?.rate} ⭐ ({producto.rating?.count})</p>
    </div>
  );
}

export default ProductDetail;
