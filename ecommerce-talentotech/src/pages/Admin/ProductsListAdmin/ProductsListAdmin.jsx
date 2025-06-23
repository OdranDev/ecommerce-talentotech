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
import "./ProductsListAdmin.scss";
import { toast } from "react-toastify";

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

  // Traer productos al iniciar
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

  // Crear nuevo producto
  const handleAgregar = async () => {
    try {
      const docRef = await addDoc(collection(db, "products"), {
        ...nuevoProducto,
        price: parseFloat(nuevoProducto.price),
        rating: { average: 0, count: 0 },
        createdAt: serverTimestamp(),
      });
      toast.success("Producto agregado");
      setProductos([...productos, { id: docRef.id, ...nuevoProducto }]);
      setNuevoProducto({
        title: "",
        price: "",
        description: "",
        category: "",
        image: "",
      });
    } catch (error) {
      toast.error("Error al agregar producto");
    }
  };

  // Eliminar producto
  const handleEliminar = async (id) => {
    try {
      await deleteDoc(doc(db, "products", id));
      toast.success("Producto eliminado");
      setProductos(productos.filter((p) => p.id !== id));
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  // Guardar cambios en edición
  const handleGuardarEdicion = async (id) => {
    try {
      const ref = doc(db, "products", id);
      await updateDoc(ref, {
        ...editando,
        price: parseFloat(editando.price),
      });
      toast.success("Producto actualizado");
      setProductos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...editando } : p))
      );
      setEditando(null);
    } catch (error) {
      toast.error("Error al actualizar");
    }
  };

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
        <h3>Productos existentes</h3>
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
                  ⭐ {producto.rating?.average || 0} ({producto.rating?.count || 0})
                </p>
                <button onClick={() => setEditando(producto)}>Editar</button>
                <button onClick={() => handleEliminar(producto.id)}>Eliminar</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsListAdmin;
