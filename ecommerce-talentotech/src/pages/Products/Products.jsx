import React, { useEffect, useState, useContext, useRef } from "react";
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

const PRODUCTS_PER_PAGE = 12;

function Products() {
  const { addToCart } = useContext(CartContext);
  const { titulo } = useContext(GlobalContext);
  const { busqueda } = useSearch();

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("all");
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [pageStack, setPageStack] = useState([]);
  const [totalProductos, setTotalProductos] = useState(0);
  const [initialized, setInitialized] = useState(false);
  
  // Nuevas variables para manejo correcto de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [todosLosProductos, setTodosLosProductos] = useState([]); // Para filtros locales

  const agregadoIdRef = useRef(null);

  // Función para obtener todos los productos una sola vez
  const fetchTodosLosProductos = async () => {
    try {
      const snapshot = await getDocs(
        query(collection(db, "products"), orderBy("title", "asc"))
      );
      
      const productosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTodosLosProductos(productosData);
      setTotalProductos(productosData.length);

      // Extraer categorías únicas
      const cats = Array.from(new Set(productosData.map((p) => p.category)));
      setCategorias(cats);
      
      return productosData;
    } catch (error) {
      console.error("Error al obtener todos los productos:", error);
      toast.error("Error al cargar productos.");
      return [];
    }
  };

  // Función para filtrar productos
  const filtrarProductos = (productos) => {
    let filtrados = [...productos];

    // Filtrar por categoría
    if (categoriaSeleccionada !== "all") {
      filtrados = filtrados.filter((p) => p.category === categoriaSeleccionada);
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase().trim();
      filtrados = filtrados.filter(
        (p) =>
          p.title?.toLowerCase().includes(termino) ||
          p.category?.toLowerCase().includes(termino) ||
          p.description?.toLowerCase().includes(termino)
      );
    }

    // Mantener orden alfabético
    filtrados.sort((a, b) => a.title.localeCompare(b.title));

    return filtrados;
  };

  // Función para obtener productos paginados
  const obtenerProductosPaginados = (productosFiltrados, pagina) => {
    const inicio = (pagina - 1) * PRODUCTS_PER_PAGE;
    const fin = inicio + PRODUCTS_PER_PAGE;
    return productosFiltrados.slice(inicio, fin);
  };

  // Efecto inicial para cargar todos los productos
  useEffect(() => {
    const cargarProductos = async () => {
      setLoading(true);
      toast.dismiss();
      
      const productos = await fetchTodosLosProductos();
      setInitialized(true);
      setLoading(false);
    };

    cargarProductos();
  }, []);

  // Efecto para filtrar y paginar cuando cambian los filtros
  useEffect(() => {
    if (!initialized) return;

    // Filtrar productos
    const filtrados = filtrarProductos(todosLosProductos);
    
    // Resetear a página 1 cuando cambian los filtros
    setPaginaActual(1);
    
    // Obtener productos para la página actual
    const productosPaginados = obtenerProductosPaginados(filtrados, 1);
    
    setProductosFiltrados(filtrados);
    setProductos(productosPaginados);
    
  }, [categoriaSeleccionada, busqueda, todosLosProductos, initialized]);

  // Efecto para cambiar página
  useEffect(() => {
    if (!initialized) return;

    const filtrados = filtrarProductos(todosLosProductos);
    const productosPaginados = obtenerProductosPaginados(filtrados, paginaActual);
    
    setProductos(productosPaginados);
  }, [paginaActual]);

  // Funciones de navegación
  const irAPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
  };

  const irAPaginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };

  const irAPaginaSiguiente = () => {
    const totalPaginas = Math.ceil(productosFiltrados.length / PRODUCTS_PER_PAGE);
    if (paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
    }
  };

  const handleAddToCart = (producto) => {
    try {
      if (!producto) return;

      addToCart(producto);
      toast.success("Producto agregado al carrito 🛒", {
        toastId: `cart-${producto.id}`,
      });

      agregadoIdRef.current = producto.id;

      setTimeout(() => {
        agregadoIdRef.current = null;
      }, 1000);
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      toast.error("Error al agregar producto.");
    }
  };

  // Cálculos para la paginación
  const totalPaginasCalculadas = Math.ceil(productosFiltrados.length / PRODUCTS_PER_PAGE);
  const totalProductosFiltrados = productosFiltrados.length;

  return (
    <div className="products-page">
      <h2>{titulo || "Todos los Productos"}</h2>

      <div className="SearchContainer">
        <SearchProducts />
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
        <Loader />
      ) : (
        <>
          <div className="products-grid">
            {productos.length > 0 ? (
              productos.map((producto) => (
                <div key={producto.id} className="product-card">
                  <img
                    src={producto.image}
                    alt={producto.title}
                    onError={(e) => (e.target.src = "../../assets/react.svg")}
                  />
                  <h3>{producto.title}</h3>
                  <div className="container-price-rating">
                    {producto.rating?.average ? (
                      <>
                        <div>
                          <span>{producto.rating.average.toFixed(1)} ⭐</span>
                          <span> ({producto.rating.count || 0})</span>
                        </div>
                        <span className="price">
                          ${producto.price.toFixed(2)}
                        </span>
                        <span className="stock">
                          Disp. {producto.stock} und
                        </span>
                      </>
                    ) : (
                      <span>Sin calificaciones</span>
                    )}
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
                        agregadoIdRef.current === producto.id ? "added" : ""
                      }`}
                      onClick={() => handleAddToCart(producto)}
                      disabled={agregadoIdRef.current === producto.id}
                    >
                      {agregadoIdRef.current === producto.id ? (
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
                    : "No hay productos para esta categoría."}
                </p>
              </div>
            )}
          </div>

          {totalPaginasCalculadas > 1 && (
            <>
              <div className="pagination-info">
                <p>
                  Página <strong>{paginaActual}</strong> de{" "}
                  <strong>{totalPaginasCalculadas}</strong> | 
                  {busqueda || categoriaSeleccionada !== "all" ? (
                    <> Productos filtrados: <strong>{totalProductosFiltrados}</strong> de <strong>{totalProductos}</strong></>
                  ) : (
                    <> Total productos: <strong>{totalProductos}</strong></>
                  )}
                </p>
              </div>
              <div className="pagination-controls">
                <button
                  disabled={paginaActual <= 1}
                  onClick={irAPaginaAnterior}
                >
                  ← Anterior
                </button>
                <button
                  disabled={paginaActual >= totalPaginasCalculadas}
                  onClick={irAPaginaSiguiente}
                >
                  Siguiente →
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Products;