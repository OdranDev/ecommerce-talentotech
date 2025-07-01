import React, { useEffect, useState } from "react";
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

const ProductsListAdmin = () => {
  const [productos, setProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    image: "",
  });
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(true);

  // ------------------------------
  // FUNCIONES DE VALIDACIÓN
  // ------------------------------

  const validarCampos = ({ title, price, description, category, image }) => {
    if (!title || !price || !description || !category || !image) {
      toast.warn("Todos los campos son obligatorios");
      return false;
    }

    if (isNaN(price) || parseFloat(price) <= 0) {
      toast.warn("El precio debe ser un número mayor a 0");
      return false;
    }

    if (description.length < 10) {
      toast.warn("La descripción debe tener al menos 10 caracteres");
      return false;
    }

    if (!/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(image)) {
      toast.warn("La URL de la imagen debe ser válida");
      return false;
    }

    return true;
  };

  const validarProducto = () => validarCampos(nuevoProducto);
  const validarProductoEditado = () => validarCampos(editando);

  // Función para validar y formatear precio en tiempo real
  const handlePriceChange = (value, isEditing = false) => {
    // Remover caracteres no numéricos excepto punto decimal
    const cleanValue = value.replace(/[^0-9.]/g, "");

    // Prevenir múltiples puntos decimales
    const parts = cleanValue.split(".");
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }

    // Limitar a 2 decimales
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + "." + parts[1].substring(0, 2);
    }

    return cleanValue;
  };

  // ------------------------------
  // FETCH
  // ------------------------------
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productosData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProductos(productosData);
        toast.dismiss(); // Elimina cualquier toast anterior
        toast.success(`${productosData.length} productos cargados exitosamente`);
      } catch (error) {
        // Mostrar solo un toast de error
        toast.dismiss(); // Elimina cualquier toast anterior
        toast.error("Error al cargar productos. Intenta recargar la página.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  // PARA USAR CUANDO NO TENGA LOADER

  // useEffect(() => {
  //   const fetchProductos = async () => {
  //     try {
  //       toast.info("Cargando productos...", { autoClose: 2000 });
  //       const querySnapshot = await getDocs(collection(db, "products"));
  //       const productosData = querySnapshot.docs.map((doc) => ({
  //         id: doc.id,
  //         ...doc.data(),
  //       }));
  //       setProductos(productosData);
  //       toast.success(`${productosData.length} productos cargados exitosamente`);
  //     } catch (error) {
  //       console.error("Error al cargar productos:", error);
  //       toast.error("Error al cargar productos");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchProductos();
  // }, []);

  // ------------------------------
  // AGREGAR PRODUCTO
  // ------------------------------

  const handleAgregar = async () => {
    if (!validarProducto()) return;

    const confirm = await Swal.fire({
      title: "¿Agregar producto?",
      text: "¿Deseas agregar este nuevo producto al inventario?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, agregar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      try {
        // Mostrar toast de carga
        const loadingToast = toast.loading("Agregando producto...");

        const docRef = await addDoc(collection(db, "products"), {
          ...nuevoProducto,
          price: parseFloat(nuevoProducto.price),
          rating: { average: 0, count: 0 },
          createdAt: serverTimestamp(),
        });

        const nuevoProductoCompleto = {
          id: docRef.id,
          ...nuevoProducto,
          price: parseFloat(nuevoProducto.price),
          rating: { average: 0, count: 0 },
        };

        setProductos([...productos, nuevoProductoCompleto]);
        setNuevoProducto({
          title: "",
          price: "",
          description: "",
          category: "",
          image: "",
        });

        // Cerrar toast de carga y mostrar éxito
        toast.dismiss(loadingToast);
        toast.success(
          `Producto "${nuevoProducto.title}" agregado exitosamente`
        );

        Swal.fire("Agregado", "El producto fue agregado con éxito", "success");
      } catch (error) {
        console.error("Error al agregar producto:", error);
        toast.error("Error al agregar producto. Inténtalo nuevamente.");
      }
    }
  };

  // ------------------------------
  // GUARDAR EDICIÓN
  // ------------------------------

  const handleGuardarEdicion = async (id) => {
    if (!validarProductoEditado()) return;

    try {
      // Mostrar toast de carga
      const loadingToast = toast.loading("Actualizando producto...");

      const ref = doc(db, "products", id);
      const productToUpdate = {
        ...editando,
        price: parseFloat(editando.price),
      };

      await updateDoc(ref, productToUpdate);

      setProductos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...productToUpdate } : p))
      );

      // Cerrar toast de carga y mostrar éxito
      toast.dismiss(loadingToast);
      toast.success(`Producto "${editando.title}" actualizado exitosamente`);
      setEditando(null);
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      toast.error("Error al actualizar el producto. Inténtalo nuevamente.");
    }
  };

  // ------------------------------
  // ELIMINAR
  // ------------------------------

  const handleEliminar = async (id) => {
    const producto = productos.find((p) => p.id === id);

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `Esta acción eliminará "${producto?.title}" permanentemente.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        // Mostrar toast de carga
        const loadingToast = toast.loading("Eliminando producto...");

        await deleteDoc(doc(db, "products", id));
        setProductos(productos.filter((p) => p.id !== id));

        // Cerrar toast de carga y mostrar éxito
        toast.dismiss(loadingToast);
        toast.success(`Producto "${producto?.title}" eliminado exitosamente`);

        Swal.fire("Eliminado", "El producto ha sido eliminado.", "success");
      } catch (error) {
        console.error("Error al eliminar producto:", error);
        toast.error("Error al eliminar el producto. Inténtalo nuevamente.");
      }
    }
  };

  // ------------------------------
  // UI
  // ------------------------------

  if (loading) {
    return (
      <div className="loader-container">
        <Loader />
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="products-admin">
      <h2>Gestión de Productos</h2>

      {/* FORMULARIO AGREGAR */}
      <div className="form-agregar">
        <h3>Agregar nuevo producto</h3>
        <input
          type="text"
          placeholder="Título"
          value={nuevoProducto.title}
          onChange={(e) =>
            setNuevoProducto({ ...nuevoProducto, title: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Precio (solo números)"
          value={nuevoProducto.price}
          onChange={(e) => {
            const formattedPrice = handlePriceChange(e.target.value);
            setNuevoProducto({ ...nuevoProducto, price: formattedPrice });
          }}
          onKeyPress={(e) => {
            // Permitir solo números, punto decimal y teclas de control
            if (
              !/[0-9.]/.test(e.key) &&
              !["Backspace", "Delete", "Tab", "Enter"].includes(e.key)
            ) {
              e.preventDefault();
              toast.warn("Solo se permiten números en el precio");
            }
          }}
        />
        <input
          type="text"
          placeholder="Categoría"
          value={nuevoProducto.category}
          onChange={(e) =>
            setNuevoProducto({ ...nuevoProducto, category: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="URL de imagen"
          value={nuevoProducto.image}
          onChange={(e) =>
            setNuevoProducto({ ...nuevoProducto, image: e.target.value })
          }
        />
        <textarea
          placeholder="Descripción (mínimo 10 caracteres)"
          value={nuevoProducto.description}
          onChange={(e) =>
            setNuevoProducto({ ...nuevoProducto, description: e.target.value })
          }
        />
        <button onClick={handleAgregar}>Agregar producto</button>
      </div>

      {/* LISTA DE PRODUCTOS */}
      <div className="lista-productos">
        <h3 className="productosExistentes">
          Productos existentes ({productos.length})
        </h3>
        <div className="productsContainer">
          {productos.map((producto) => (
            <div key={producto.id} className="producto-item">
              {editando?.id === producto.id ? (
                <>
                  <input
                    placeholder="Título"
                    value={editando.title}
                    onChange={(e) =>
                      setEditando({ ...editando, title: e.target.value })
                    }
                  />
                  <input
                    placeholder="Precio (solo números)"
                    value={editando.price}
                    onChange={(e) => {
                      const formattedPrice = handlePriceChange(
                        e.target.value,
                        true
                      );
                      setEditando({ ...editando, price: formattedPrice });
                    }}
                    onKeyPress={(e) => {
                      if (
                        !/[0-9.]/.test(e.key) &&
                        !["Backspace", "Delete", "Tab", "Enter"].includes(e.key)
                      ) {
                        e.preventDefault();
                        toast.warn("Solo se permiten números en el precio");
                      }
                    }}
                  />
                  <input
                    placeholder="Categoría"
                    value={editando.category}
                    onChange={(e) =>
                      setEditando({ ...editando, category: e.target.value })
                    }
                  />
                  <input
                    placeholder="URL de imagen"
                    value={editando.image}
                    onChange={(e) =>
                      setEditando({ ...editando, image: e.target.value })
                    }
                  />
                  <textarea
                    placeholder="Descripción (mínimo 10 caracteres)"
                    value={editando.description}
                    onChange={(e) =>
                      setEditando({ ...editando, description: e.target.value })
                    }
                  />
                  <button onClick={() => handleGuardarEdicion(producto.id)}>
                    Guardar
                  </button>
                  <button onClick={() => setEditando(null)}>Cancelar</button>
                </>
              ) : (
                <>
                  <h4>{producto.title}</h4>
                  <p>${parseFloat(producto.price).toFixed(2)}</p>
                  <p>{producto.category}</p>
                  <img src={producto.image} alt={producto.title} width={80} />
                  <p>{producto.description.slice(0, 100)}...</p>
                  <p>
                    ⭐ {producto.rating?.average || 0} (
                    {producto.rating?.count || 0})
                  </p>
                  <button onClick={() => setEditando(producto)}>Editar</button>
                  <button onClick={() => handleEliminar(producto.id)}>
                    Eliminar
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsListAdmin;
