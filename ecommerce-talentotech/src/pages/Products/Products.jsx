import React, { useEffect, useState, useContext } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../auth/Firebase.js";
import { CartContext } from "../../context/CartContext.jsx";
import { GlobalContext } from "../../context/GlobalContext.jsx";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BsCartPlus } from "react-icons/bs";
import Loader from "../../components/loader/Loader.jsx";
import "./Products.scss";

function Products() {
  const { addToCart } = useContext(CartContext);
  const { titulo } = useContext(GlobalContext);

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("all");
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [agregadoId, setAgregadoId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Obtener productos de Firestore
  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const productosData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProductos(productosData);

        const cats = Array.from(new Set(productosData.map((p) => p.category)));
        setCategorias(cats);
      } catch (error) {
        console.error("Error al obtener productos de Firestore:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  // Filtrar productos por categoría
  useEffect(() => {
    const filtrados =
      categoriaSeleccionada === "all"
        ? productos
        : productos.filter((p) => p.category === categoriaSeleccionada);

    setProductosFiltrados(filtrados);
  }, [categoriaSeleccionada, productos]);

  const handleAddToCart = (producto) => {
    addToCart(producto);
    toast.success("Producto agregado al carrito 🛒");
    setAgregadoId(producto.id);
    setTimeout(() => setAgregadoId(null), 1000);
  };

  if (loading) {
    return (
      <div className="loader-container">
        <Loader />
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      <h2>{titulo || "Todos los Productos"}</h2>

      {/* FILTRO DE CATEGORÍAS */}
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
              className={
                categoriaSeleccionada === cat ? "chip active" : "chip"
              }
              onClick={() => setCategoriaSeleccionada(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* GRID DE PRODUCTOS */}
      <div className="products-grid">
        {productosFiltrados.map((producto) => (
          <div key={producto.id} className="product-card">
            <img src={producto.image} alt={producto.title} />
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
            <h3>{producto.title}</h3>
            <p>${producto.price.toFixed(2)}</p>
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
        ))}
      </div>

      <ToastContainer position="top-right" autoClose={1500} />
    </div>
  );
}

export default Products;



// import React, { useEffect, useState, useContext } from "react";
// import { CartContext } from "../../context/CartContext.jsx";
// import { GlobalContext } from "../../context/GlobalContext.jsx";
// import { Link } from "react-router-dom";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { BsCartPlus } from "react-icons/bs";
// import Loader from "../../components/loader/Loader.jsx";
// import useFetch from "../../hooks/useFetch";
// import "./Products.scss";

// function Products() {
//   const { addToCart } = useContext(CartContext);
//   const { titulo } = useContext(GlobalContext);

//   const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("all");
//   const [productosFiltrados, setProductosFiltrados] = useState([]);
//   const [agregadoId, setAgregadoId] = useState(null);

//   // Fetch productos completos
//   const {
//     data: productos,
//     cargando: cargandoProductos,
//     error: errorProductos,
//   } = useFetch("https://fakestoreapi.com/products");

//   // Fetch categorías
//   const {
//     data: categorias,
//     cargando: cargandoCategorias,
//     error: errorCategorias,
//   } = useFetch("https://fakestoreapi.com/products/categories");

//   // Filtrado dinámico
//   useEffect(() => {
//     if (!productos) return;

//     const filtrados =
//       categoriaSeleccionada === "all"
//         ? productos
//         : productos.filter((p) => p.category === categoriaSeleccionada);

//     setProductosFiltrados(filtrados);
//   }, [categoriaSeleccionada, productos]);

//   // Agregar al carrito
//   const handleAddToCart = (producto) => {
//     addToCart(producto);
//     toast.success("Producto agregado al carrito 🛒");
//     setAgregadoId(producto.id);
//     setTimeout(() => setAgregadoId(null), 1000);
//   };

//   // Estado de carga / error
//   if (cargandoProductos || cargandoCategorias) {
//     return (
//       <div className="loader-container">
//         <Loader />
//         <p>Cargando productos...</p>
//       </div>
//     );
//   }

//   if (errorProductos || errorCategorias)
//     return <p>{errorProductos || errorCategorias}</p>;

//   return (
//     <div className="products-page">
//       <h2>{titulo}</h2>

//       {/* FILTRO DE CATEGORÍAS */}
//       <div className="category-filter">
//         <label htmlFor="categoria">Filtrar por categoría:</label>
//         <select
//           id="categoria"
//           value={categoriaSeleccionada}
//           onChange={(e) => setCategoriaSeleccionada(e.target.value)}
//           className="category-select"
//         >
//           <option value="all">Todos</option>
//           {categorias &&
//             categorias.map((cat) => (
//               <option key={cat} value={cat}>
//                 {cat.charAt(0).toUpperCase() + cat.slice(1)}
//               </option>
//             ))}
//         </select>

//         <div className="category-chips">
//           <button
//             className={categoriaSeleccionada === "all" ? "chip active" : "chip"}
//             onClick={() => setCategoriaSeleccionada("all")}
//           >
//             Todos
//           </button>
//           {categorias &&
//             categorias.map((cat) => (
//               <button
//                 key={cat}
//                 className={
//                   categoriaSeleccionada === cat ? "chip active" : "chip"
//                 }
//                 onClick={() => setCategoriaSeleccionada(cat)}
//               >
//                 {cat.charAt(0).toUpperCase() + cat.slice(1)}
//               </button>
//             ))}
//         </div>
//       </div>

//       {/* GRID DE PRODUCTOS */}
//       <div className="products-grid">
//         {productosFiltrados.map((producto) => (
//           <div key={producto.id} className="product-card">
//             <img src={producto.image} alt={producto.title} />
//             <p>
//               <span>{producto.rating.rate} ⭐ </span>
//               <span>({producto.rating.count})</span>
//             </p>
//             <h3>{producto.title}</h3>
//             <p>${producto.price}</p>
//             <div className="button-container">
//               <Link to={`/products/${producto.id}`} className="btn-detail">
//                 Ver más
//               </Link>
//               <button
//                 className={`btn-add ${
//                   agregadoId === producto.id ? "added" : ""
//                 }`}
//                 onClick={() => handleAddToCart(producto)}
//                 disabled={agregadoId === producto.id}
//               >
//                 {agregadoId === producto.id ? (
//                   "Agregado ✅"
//                 ) : (
//                   <>
//                     <BsCartPlus style={{ marginRight: "6px" }} />
//                     Agregar al carrito
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       <ToastContainer position="top-right" autoClose={1500} />
//     </div>
//   );
// }

// export default Products;
