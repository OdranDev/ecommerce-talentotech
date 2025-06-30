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
      } catch (error) {
        toast.error("Error al cargar productos");
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

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
        const docRef = await addDoc(collection(db, "products"), {
          ...nuevoProducto,
          price: parseFloat(nuevoProducto.price),
          rating: { average: 0, count: 0 },
          createdAt: serverTimestamp(),
        });

        setProductos([...productos, { id: docRef.id, ...nuevoProducto }]);
        setNuevoProducto({
          title: "",
          price: "",
          description: "",
          category: "",
          image: "",
        });

        Swal.fire("Agregado", "El producto fue agregado con éxito", "success");
      } catch (error) {
        toast.error("Error al agregar producto");
      }
    }
  };

  // ------------------------------
  // GUARDAR EDICIÓN
  // ------------------------------

  const handleGuardarEdicion = async (id) => {
    if (!validarProductoEditado()) return;

    try {
      const ref = doc(db, "products", id);
      await updateDoc(ref, {
        ...editando,
        price: parseFloat(editando.price),
      });

      setProductos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...editando } : p))
      );

      toast.success("Producto actualizado");
      setEditando(null);
    } catch (error) {
      toast.error("Error al actualizar");
    }
  };

  // ------------------------------
  // ELIMINAR
  // ------------------------------

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el producto permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "products", id));
        setProductos(productos.filter((p) => p.id !== id));
        Swal.fire("Eliminado", "El producto ha sido eliminado.", "success");
      } catch (error) {
        toast.error("Error al eliminar el producto");
      }
    }
  };

  // ------------------------------
  // UI
  // ------------------------------

  if (loading) return <p>Cargando productos...</p>;

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
          placeholder="Precio"
          value={nuevoProducto.price}
          onChange={(e) =>
            setNuevoProducto({ ...nuevoProducto, price: e.target.value })
          }
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
          placeholder="Descripción"
          value={nuevoProducto.description}
          onChange={(e) =>
            setNuevoProducto({ ...nuevoProducto, description: e.target.value })
          }
        />
        <button onClick={handleAgregar}>Agregar producto</button>
      </div>

      {/* LISTA DE PRODUCTOS */}
      <div className="lista-productos">
        <h3 className="productosExistentes">Productos existentes</h3>
        <div className="productsContainer">
          {productos.map((producto) => (
            <div key={producto.id} className="producto-item">
              {editando?.id === producto.id ? (
                <>
                  <input
                    value={editando.title}
                    onChange={(e) =>
                      setEditando({ ...editando, title: e.target.value })
                    }
                  />
                  <input
                    value={editando.price}
                    onChange={(e) =>
                      setEditando({ ...editando, price: e.target.value })
                    }
                  />
                  <input
                    value={editando.category}
                    onChange={(e) =>
                      setEditando({ ...editando, category: e.target.value })
                    }
                  />
                  <input
                    value={editando.image}
                    onChange={(e) =>
                      setEditando({ ...editando, image: e.target.value })
                    }
                  />
                  <textarea
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
                  <p>${producto.price}</p>
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

