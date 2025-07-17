import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../auth/Firebase";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "./ProductsListAdmin.scss";
import Loader from "../../../components/loader/Loader.jsx";
import SearchProducts from "../../Products/SearchProducts/SearchProducts.jsx";
import { useSearch } from "../../../context/SearchContext";

const PRODUCTS_PER_PAGE = 12; // Puedes ajustar este número según tus necesidades

function FormularioProducto({
  producto,
  onChange,
  onSubmit,
  submitText,
  onCancel,
  categorias = [],
}) {
  return (
    <div className="form-producto">
      <input
        type="text"
        placeholder="Título"
        value={producto.title}
        onChange={(e) => onChange("title", e.target.value)}
        maxLength={100}
      />
      <input
        type="text"
        placeholder="Precio"
        value={producto.price}
        onChange={(e) => onChange("price", e.target.value)}
        inputMode="decimal"
      />
      <input
        type="text"
        placeholder="Categoría"
        value={producto.category}
        onChange={(e) => onChange("category", e.target.value)}
        maxLength={50}
        list="categorias-sugeridas"
      />
      <datalist id="categorias-sugeridas">
        {categorias.length > 0 ? (
          categorias.map((cat, i) => <option key={i} value={cat} />)
        ) : (
          <option value="No hay categorías" disabled />
        )}
      </datalist>

      <input
        type="url"
        placeholder="URL de imagen"
        value={producto.image}
        onChange={(e) => onChange("image", e.target.value)}
      />
      <input
        type="text"
        placeholder="Stock"
        value={producto.stock}
        onChange={(e) => onChange("stock", e.target.value)}
        inputMode="numeric"
      />
      <textarea
        placeholder="Descripción"
        value={producto.description}
        onChange={(e) => onChange("description", e.target.value)}
        rows={4}
      />
      <div className="form-buttons">
        <button onClick={onSubmit} className="btn-primary">
          {submitText}
        </button>
        {onCancel && (
          <button onClick={onCancel} className="btn-secondary">
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

const ProductsListAdmin = () => {
  const [productos, setProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    image: "",
    stock: "",
  });
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);

  const { busqueda } = useSearch();

  const productosFiltrados = useMemo(() => {
    if (!busqueda) return productos;
    const busquedaLower = busqueda.toLowerCase();
    return productos.filter((producto) =>
      [producto.title, producto.description, producto.category].some((campo) =>
        campo.toLowerCase().includes(busquedaLower)
      )
    );
  }, [productos, busqueda]);

  // Productos paginados
  const productosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * PRODUCTS_PER_PAGE;
    const fin = inicio + PRODUCTS_PER_PAGE;
    return productosFiltrados.slice(inicio, fin);
  }, [productosFiltrados, paginaActual]);

  // Cálculos para paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / PRODUCTS_PER_PAGE);
  const totalProductos = productos.length;
  const totalProductosFiltrados = productosFiltrados.length;

  // Resetear página cuando cambie la búsqueda
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  const formatPrice = useCallback((value) => {
    if (!value) return "";
    let cleanValue = value.replace(/[^0-9.]/g, "");
    const parts = cleanValue.split(".");
    if (parts.length > 2) {
      cleanValue = parts[0] + "." + parts.slice(1).join("");
    }
    if (parts[1] && parts[1].length > 2) {
      cleanValue = parts[0] + "." + parts[1].substring(0, 2);
    }
    return cleanValue;
  }, []);

  const formatStock = useCallback((value) => value.replace(/\D/g, ""), []);

  const validarCampos = useCallback(
    ({ title, price, description, category, image, stock }) => {
      const errores = [];

      if (!title?.trim()) errores.push("El título es obligatorio");
      if (!price) errores.push("El precio es obligatorio");
      if (!description?.trim()) errores.push("La descripción es obligatoria");
      if (!category?.trim()) errores.push("La categoría es obligatoria");
      if (!image?.trim()) errores.push("La URL de la imagen es obligatoria");
      if (!stock) errores.push("El stock es obligatorio");

      if (price && (isNaN(price) || parseFloat(price) <= 0)) {
        errores.push("El precio debe ser un número mayor a 0");
      }

      if (description?.trim() && description.trim().length < 10) {
        errores.push("La descripción debe tener al menos 10 caracteres");
      }

      if (
        image?.trim() &&
        !/^https?:\/\/.*\.(jpg|jpeg|png|webp|gif|svg)$/i.test(image)
      ) {
        errores.push(
          "La URL de la imagen debe ser válida y terminar en un formato correcto"
        );
      }

      if (
        stock &&
        (isNaN(stock) ||
          parseInt(stock) <= 0 ||
          !Number.isInteger(Number(stock)))
      ) {
        errores.push("El stock debe ser un número entero mayor a 0");
      }

      if (errores.length > 0) {
        toast.warn(errores[0]);
        return false;
      }

      return true;
    },
    []
  );

  const handleInputChange = useCallback(
    (field, value, isEditing = false) => {
      const setter = isEditing ? setEditando : setNuevoProducto;
      let processedValue = value;

      switch (field) {
        case "price":
          processedValue = formatPrice(value);
          break;
        case "stock":
          processedValue = formatStock(value);
          break;
        case "title":
        case "category":
        case "description":
          processedValue = value.trimStart();
          break;
      }

      setter((prev) => ({
        ...prev,
        [field]: processedValue,
      }));
    },
    [formatPrice, formatStock]
  );

  const fetchProductos = useCallback(async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "products"));
      const productosData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Ordenar alfabéticamente por título
      productosData.sort((a, b) => a.title.localeCompare(b.title));

      setProductos(productosData);
      toast.dismiss();
      toast.success(`${productosData.length} productos cargados exitosamente`);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      toast.dismiss();
      toast.error("Error al cargar productos. Intenta recargar la página.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  const handleAgregar = useCallback(async () => {
    if (!validarCampos(nuevoProducto)) return;

    const confirm = await Swal.fire({
      title: "¿Agregar producto?",
      text: "¿Deseas agregar este nuevo producto al inventario?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, agregar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      const loadingToast = toast.loading("Agregando producto...");

      const productoData = {
        ...nuevoProducto,
        title: nuevoProducto.title.trim(),
        description: nuevoProducto.description.trim(),
        category: nuevoProducto.category.trim(),
        image: nuevoProducto.image.trim(),
        price: parseFloat(nuevoProducto.price),
        stock: parseInt(nuevoProducto.stock),
        rating: { average: 0, count: 0 },
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "products"), productoData);

      setProductos((prev) => {
        const newProducts = [...prev, { id: docRef.id, ...productoData }];
        // Mantener orden alfabético
        return newProducts.sort((a, b) => a.title.localeCompare(b.title));
      });

      setNuevoProducto({
        title: "",
        price: "",
        description: "",
        category: "",
        image: "",
        stock: "",
      });

      toast.dismiss(loadingToast);
      toast.success(`Producto "${productoData.title}" agregado exitosamente`);
      Swal.fire("Agregado", "El producto fue agregado con éxito", "success");
    } catch (error) {
      console.error("Error al agregar producto:", error);
      toast.error("Error al agregar producto. Inténtalo nuevamente.");
    }
  }, [nuevoProducto, validarCampos]);

  const handleGuardarEdicion = useCallback(
    async (id) => {
      if (!validarCampos(editando)) return;

      try {
        const loadingToast = toast.loading("Actualizando producto...");

        const productoData = {
          ...editando,
          title: editando.title.trim(),
          description: editando.description.trim(),
          category: editando.category.trim(),
          image: editando.image.trim(),
          price: parseFloat(editando.price),
          stock: parseInt(editando.stock),
        };

        await updateDoc(doc(db, "products", id), productoData);

        setProductos((prev) => {
          const updated = prev.map((p) =>
            p.id === id ? { ...p, ...productoData } : p
          );
          // Mantener orden alfabético
          return updated.sort((a, b) => a.title.localeCompare(b.title));
        });

        toast.dismiss(loadingToast);
        toast.success(`Producto "${productoData.title}" actualizado`);
        setEditando(null);
      } catch (error) {
        console.error("Error al actualizar producto:", error);
        toast.error("Error al actualizar el producto.");
      }
    },
    [editando, validarCampos]
  );

  const handleEliminar = useCallback(
    async (id) => {
      const producto = productos.find((p) => p.id === id);
      if (!producto) return;

      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: `Esta acción eliminará "${producto.title}" permanentemente.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      if (!result.isConfirmed) return;

      try {
        const loadingToast = toast.loading("Eliminando producto...");
        await deleteDoc(doc(db, "products", id));
        setProductos((prev) => prev.filter((p) => p.id !== id));
        toast.dismiss(loadingToast);
        toast.success(`Producto "${producto.title}" eliminado`);
        Swal.fire("Eliminado", "El producto ha sido eliminado.", "success");
      } catch (error) {
        console.error("Error al eliminar producto:", error);
        toast.error("Error al eliminar el producto.");
      }
    },
    [productos]
  );

  // Funciones de navegación de paginación
  const irAPaginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };

  const irAPaginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
    }
  };

  const irAPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  // Generar números de páginas para mostrar
  const generarNumerosPaginas = () => {
    const numeros = [];
    const rango = 2; // Mostrar 2 páginas antes y después de la actual

    let inicio = Math.max(1, paginaActual - rango);
    let fin = Math.min(totalPaginas, paginaActual + rango);

    // Ajustar si estamos cerca del inicio o fin
    if (fin - inicio < rango * 2) {
      if (inicio === 1) {
        fin = Math.min(totalPaginas, inicio + rango * 2);
      } else {
        inicio = Math.max(1, fin - rango * 2);
      }
    }

    for (let i = inicio; i <= fin; i++) {
      numeros.push(i);
    }

    return numeros;
  };

  const categoriasExistentes = useMemo(() => {
    const todas = productos.map((p) => p.category?.trim()).filter(Boolean);
    const unicas = Array.from(new Set(todas)).sort((a, b) =>
      a.localeCompare(b)
    );
    return unicas;
  }, [productos]);

  if (loading) {
    return (
      <div className="loader-container" style={{ marginTop: "30vh" }}>
        <Loader />
      </div>
    );
  }

  return (
    <div className="products-admin">
      <div className="products-admin-header">
        <Link to="/admin">
          <button className="btn-back">← Volver</button>
        </Link>
        <h2>Gestión de Productos</h2>
        <h3 className="productosExistentes">
          Productos existentes ({totalProductos})
        </h3>

      </div>
      {/* Formulario agregar */}
      <div className="form-agregar">
        <h3>Agregar nuevo producto</h3>
        <FormularioProducto
          producto={nuevoProducto}
          onChange={(field, value) => handleInputChange(field, value, false)}
          onSubmit={handleAgregar}
          submitText="Agregar producto"
          categorias={categoriasExistentes}
        />
      </div>

      {/* Lista de productos */}
      <div className="lista-productos">
        
        <SearchProducts />

        {/* Información de paginación */}
        {totalPaginas > 1 && (
          <div className="pagination-info">
            <p>
              Página <strong>{paginaActual}</strong> de{" "}
              <strong>{totalPaginas}</strong>
              {busqueda ? (
                <>
                  {" "}
                  | Productos filtrados:{" "}
                  <strong>{totalProductosFiltrados}</strong> de{" "}
                  <strong>{totalProductos}</strong>
                </>
              ) : (
                <>
                  {" "}
                  | Total productos: <strong>{totalProductos}</strong>
                </>
              )}
            </p>
          </div>
        )}

        {productosFiltrados.length === 0 ? (
          <p className="no-resultados">
            {busqueda ? (
              <>
                No se encontraron productos que coincidan con:{" "}
                <strong>{busqueda}</strong>
              </>
            ) : (
              "No hay productos para mostrar"
            )}
          </p>
        ) : (
          <>
            <div className="productsContainer">
              {productosPaginados.map((producto) => (
                <div key={producto.id} className="producto-item">
                  {editando?.id === producto.id ? (
                    <FormularioProducto
                      producto={editando}
                      onChange={(field, value) =>
                        handleInputChange(field, value, true)
                      }
                      onSubmit={() => handleGuardarEdicion(editando.id)}
                      onCancel={editando ? () => setEditando(null) : null}
                      submitText={editando ? "Guardar" : "Agregar producto"}
                      categorias={categoriasExistentes}
                    />
                  ) : (
                    <div className="producto-display">
                      <img
                        src={producto.image}
                        alt={producto.title}
                        width={80}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <h4>{producto.title}</h4>
                      <p className="categoria">{producto.category}</p>
                      <p className="descripcion">
                        {producto.description.length > 100
                          ? `${producto.description.slice(0, 100)}...`
                          : producto.description}
                      </p>
                      <div className="container-rate-price-stock">
                        <p className="rating">
                          ⭐ {producto.rating?.average || 0} (
                          {producto.rating?.count || 0})
                        </p>
                        <p className="price">
                          ${parseFloat(producto.price).toFixed(2)}
                        </p>
                        <p className="stock">Stock: {producto.stock}</p>
                      </div>
                      <div className="producto-actions">
                        <button
                          onClick={() => setEditando(producto)}
                          className="btn-edit"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(producto.id)}
                          className="btn-delete"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Controles de paginación */}
            {totalPaginas > 1 && (
              <div className="pagination-controls">
                <button
                  disabled={paginaActual <= 1}
                  onClick={irAPaginaAnterior}
                  className="pagination-btn"
                >
                  ← Anterior
                </button>

                {/* Números de página */}
                <div className="pagination-numbers">
                  {paginaActual > 3 && (
                    <>
                      <button
                        onClick={() => irAPagina(1)}
                        className="pagination-number"
                      >
                        1
                      </button>
                      {paginaActual > 4 && (
                        <span className="pagination-dots">...</span>
                      )}
                    </>
                  )}

                  {generarNumerosPaginas().map((numero) => (
                    <button
                      key={numero}
                      onClick={() => irAPagina(numero)}
                      className={`pagination-number ${
                        numero === paginaActual ? "active" : ""
                      }`}
                    >
                      {numero}
                    </button>
                  ))}

                  {paginaActual < totalPaginas - 2 && (
                    <>
                      {paginaActual < totalPaginas - 3 && (
                        <span className="pagination-dots">...</span>
                      )}
                      <button
                        onClick={() => irAPagina(totalPaginas)}
                        className="pagination-number"
                      >
                        {totalPaginas}
                      </button>
                    </>
                  )}
                </div>

                <button
                  disabled={paginaActual >= totalPaginas}
                  onClick={irAPaginaSiguiente}
                  className="pagination-btn"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsListAdmin;
