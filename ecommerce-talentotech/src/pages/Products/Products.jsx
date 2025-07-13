import React, { useEffect, useState, useContext } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../../auth/Firebase.js";
import { CartContext } from "../../context/CartContext.jsx";
import { GlobalContext } from "../../context/GlobalContext.jsx";
import { useSearch } from "../../context/SearchContext.jsx";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { BsCartPlus } from "react-icons/bs";
import Loader from "../../components/loader/Loader.jsx";
import "./Products.scss";
import SearchProducts from "./SearchProducts/SearchProducts.jsx";

const PRODUCTS_PER_PAGE = 6;

function Products() {
  const { addToCart } = useContext(CartContext);
  const { titulo } = useContext(GlobalContext);
  const { busqueda } = useSearch();

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("all");
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [agregadoId, setAgregadoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [pageStack, setPageStack] = useState([]);
  const [totalProductos, setTotalProductos] = useState(0);
  const [initialized, setInitialized] = useState(false);

  // Corregir la lógica de paginación
  const paginaActual = pageStack.length > 0 ? pageStack.length : 1;
  const totalPaginas = Math.ceil(totalProductos / PRODUCTS_PER_PAGE);

  const fetchProductos = async (direction = "next") => {
    try {
      setLoading(true);
      toast.dismiss();

      let q = query(
        collection(db, "products"),
        orderBy("createdAt", "desc"),
        limit(PRODUCTS_PER_PAGE)
      );

      if (direction === "next" && lastVisible) {
        q = query(
          collection(db, "products"),
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(PRODUCTS_PER_PAGE)
        );
      } else if (direction === "prev" && pageStack.length > 1) {
        const previous = pageStack[pageStack.length - 2];
        q = query(
          collection(db, "products"),
          orderBy("createdAt", "desc"),
          startAfter(previous),
          limit(PRODUCTS_PER_PAGE)
        );
      }

      const snapshot = await getDocs(q);
      const docs = snapshot.docs;

      if (docs.length === 0) {
        setTimeout(() => {
          toast.dismiss();
          toast.info("No hay más productos para mostrar.", {
            autoClose: 2000,
          });
        }, 100);
        return;
      }

      const productosData = docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProductos(productosData);
      setLastVisible(docs[docs.length - 1]);

      if (direction === "next") {
        setPageStack((prev) => [...prev, docs[0]]);
      } else if (direction === "prev") {
        setPageStack((prev) => prev.slice(0, -1));
      }

      // Carga total de productos y categorías solo la primera vez
      if (!initialized) {
        const allSnapshot = await getDocs(collection(db, "products"));
        const allData = allSnapshot.docs.map((doc) => doc.data());
        setTotalProductos(allData.length);

        const cats = Array.from(new Set(allData.map((p) => p.category)));
        setCategorias(cats);
        setInitialized(true);
      }
    } catch (error) {
      console.error("Error al obtener productos:", error);
      toast.error("Error al cargar productos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // Función para filtrar productos por búsqueda y categoría
  const filtrarProductos = () => {
    let filtrados = productos;

    // Filtrar por categoría
    if (categoriaSeleccionada !== "all") {
      filtrados = filtrados.filter((p) => p.category === categoriaSeleccionada);
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const terminoBusqueda = busqueda.toLowerCase().trim();
      filtrados = filtrados.filter((producto) => {
        const titulo = producto.title?.toLowerCase() || "";
        const categoria = producto.category?.toLowerCase() || "";
        const descripcion = producto.description?.toLowerCase() || "";
        
        return titulo.includes(terminoBusqueda) || 
               categoria.includes(terminoBusqueda) ||
               descripcion.includes(terminoBusqueda);
      });
    }

    return filtrados;
  };

  useEffect(() => {
    const filtrados = filtrarProductos();
    setProductosFiltrados(filtrados);
  }, [categoriaSeleccionada, productos, busqueda]);

  const handleAddToCart = (producto) => {
    addToCart(producto);
    toast.success("Producto agregado al carrito 🛒", {
      toastId: `cart-${producto.id}`,
    });
    setAgregadoId(producto.id);
    setTimeout(() => setAgregadoId(null), 1000);
  };

  return (
    <div className="products-page">
      <h2>{titulo || "Todos los Productos"}</h2>

      <div className="SearchContainer">
        {/* Filtros */}
        <div className="filters-container">
          {/* Filtro de Categorías */}
          <div className="category-filter">
            <label htmlFor="categoria">Filtrar por categoría:</label>
            <select
              id="categoria"
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
          </div>
        </div>

        {/* Componente de búsqueda */}
        <SearchProducts />
        
        {/* Chips de Categorías */}
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

      {loading ? (
        <div>
          <Loader />
        </div>
      ) : (
        <>
          {/* Grid de Productos */}
          <div className="products-grid">
            {productosFiltrados.length > 0 ? (
              productosFiltrados.map((producto) => (
                <div key={producto.id} className="product-card">
                  <img src={producto.image} alt={producto.title} />
                  <h3>{producto.title}</h3>
                  <div className="container-price-rating">
                    <p>
                      {producto.rating?.average ? (
                        <>
                          <span>{producto.rating.average.toFixed(1)} ⭐</span>
                          <span> ({producto.rating.count || 0})</span>
                        </>
                      ) : (
                        <span>Sin calificaciones</span>
                      )}
                    </p>
                    <p>${producto.price.toFixed(2)}</p>
                  </div>

                  <div className="button-container">
                    <Link
                      to={`/products/${producto.id}`}
                      className="btn-detail"
                    >
                      Ver más
                    </Link>
                    <button
                      className={`btn-add ${
                        agregadoId === producto.id ? "added" : ""
                      }`}
                      onClick={() => handleAddToCart(producto)}
                      disabled={agregadoId === producto.id}
                    >
                      {agregadoId === producto.id ? (
                        "Agregado ✅"
                      ) : (
                        <>
                          <BsCartPlus style={{ marginRight: "6px" }} />
                          Agregar al carrito
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-products">
                <p>
                  {busqueda 
                    ? `No se encontraron productos para "${busqueda}"`
                    : "No hay productos para esta categoría."
                  }
                </p>
              </div>
            )}
          </div>

          {/* Info de paginación - Solo mostrar si hay más de 1 página y no hay búsqueda */}
          {totalPaginas > 1 && !busqueda && (
            <div className="pagination-info">
              <p>
                Página <strong>{paginaActual}</strong> de{" "}
                <strong>{totalPaginas}</strong> | Total productos:{" "}
                <strong>{totalProductos}</strong>
              </p>
            </div>
          )}

          {/* Controles de paginación - Solo mostrar si hay más de 1 página y no hay búsqueda */}
          {totalPaginas > 1 && !busqueda && (
            <div className="pagination-controls">
              <button
                disabled={paginaActual <= 1}
                onClick={() => fetchProductos("prev")}
              >
                ← Anterior
              </button>
              <button
                disabled={paginaActual >= totalPaginas}
                onClick={() => fetchProductos("next")}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Products;