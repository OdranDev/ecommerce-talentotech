import React, { useEffect, useState, useContext } from "react";
import { CartContext } from "../../context/CartContext.jsx";
import "./Products.scss";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

function Products() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useContext(CartContext);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("all");
  const [agregadoId, setAgregadoId] = useState(null); // 👈 nuevo estado

  useEffect(() => {
    fetch("https://fakestoreapi.com/products/categories")
      .then((res) => res.json())
      .then((cats) => setCategorias(cats))
      .catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    setCargando(true);
    const url =
      categoriaSeleccionada === "all"
        ? "https://fakestoreapi.com/products"
        : `https://fakestoreapi.com/products/category/${categoriaSeleccionada}`;

    fetch(url)
      .then((respuesta) => respuesta.json())
      .then((datos) => {
        const productosUnicos = datos.filter(
          (producto, index, self) =>
            index === self.findIndex((p) => p.id === producto.id)
        );

        if (productosUnicos.length < datos.length) {
          console.warn(
            "⚠️ Productos duplicados eliminados:",
            datos.length - productosUnicos.length
          );
        }

        setProductos(productosUnicos);
        setCargando(false);
      })
      .catch(() => {
        setError("Hubo un problema al cargar los productos.");
        setCargando(false);
      });
  }, [categoriaSeleccionada]);

  if (cargando)
    return (
      <div className="products-page">
        <h2>Productos</h2>
        <p>Cargando productos...</p>
      </div>
    );

  if (error) return <p>{error}</p>;

  const handleAddToCart = (producto) => {
    addToCart(producto);
    toast.success("Producto agregado al carrito 🛒");
    setAgregadoId(producto.id);
    setTimeout(() => setAgregadoId(null), 2000);
  };

  return (
    <div className="products-page">
      <h2>Productos</h2>

      <div className="category-filter">
        <label htmlFor="categoria">Filtrar por categoría:</label>
        <select
          value={categoriaSeleccionada}
          onChange={(e) => setCategoriaSeleccionada(e.target.value)}
          className="category-select"
        >
          <option value="all">Todos</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>

        <div className="category-chips">
          <button
            className={categoriaSeleccionada === "all" ? "chip active" : "chip"}
            onClick={() => setCategoriaSeleccionada("all")}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat}
              className={categoriaSeleccionada === cat ? "chip active" : "chip"}
              onClick={() => setCategoriaSeleccionada(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="products-grid">
        {productos.map((producto) => (
          <div key={producto.id} className="product-card">
            <img src={producto.image} alt={producto.title} />
            <p>
              <span>{producto.rating.rate} ⭐ </span>
              <span>({producto.rating.count})</span>
            </p>
            <h3>{producto.title}</h3>
            <p>${producto.price}</p>
            <div className="button-container">
              <Link to={`/products/${producto.id}`} className="btn-detail">
                Ver más
              </Link>
              <button
                className={`btn-add ${
                  agregadoId === producto.id ? "added" : ""
                }`}
                onClick={() => handleAddToCart(producto)}
                disabled={agregadoId === producto.id}
              >
                {agregadoId === producto.id
                  ? "Agregado ✅"
                  : "Agregar al carrito"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;
