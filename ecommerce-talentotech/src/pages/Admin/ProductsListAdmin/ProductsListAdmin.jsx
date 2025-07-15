import React, { useEffect, useState, useCallback, useMemo } from "react";
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
    stock: "",
  });
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(true);

  // ------------------------------
  // UTILIDADES Y VALIDACIONES
  // ------------------------------

  const formatPrice = useCallback((value) => {
    if (!value) return "";
    
    // Remover caracteres no numéricos excepto punto decimal
    let cleanValue = value.replace(/[^0-9.]/g, "");
    
    // Prevenir múltiples puntos decimales
    const parts = cleanValue.split(".");
    if (parts.length > 2) {
      cleanValue = parts[0] + "." + parts.slice(1).join("");
    }
    
    // Limitar a 2 decimales
    if (parts[1] && parts[1].length > 2) {
      cleanValue = parts[0] + "." + parts[1].substring(0, 2);
    }
    
    return cleanValue;
  }, []);

  const formatStock = useCallback((value) => {
    // Solo permitir números enteros
    return value.replace(/\D/g, "");
  }, []);

  const validarCampos = useCallback(({
    title,
    price,
    description,
    category,
    image,
    stock,
  }) => {
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

    if (image?.trim() && !/^https?:\/\/.*\.(jpg|jpeg|png|webp|gif|svg)$/i.test(image)) {
      errores.push("La URL de la imagen debe ser válida y terminar en jpg, jpeg, png, webp, gif o svg");
    }

    if (stock && (isNaN(stock) || parseInt(stock) <= 0 || !Number.isInteger(Number(stock)))) {
      errores.push("El stock debe ser un número entero mayor a 0");
    }

    if (errores.length > 0) {
      toast.warn(errores[0]); // Mostrar solo el primer error
      return false;
    }

    return true;
  }, []);

  // ------------------------------
  // HANDLERS DE CAMBIO
  // ------------------------------

  const handleInputChange = useCallback((field, value, isEditing = false) => {
    const setter = isEditing ? setEditando : setNuevoProducto;
    const currentState = isEditing ? editando : nuevoProducto;

    let processedValue = value;

    // Procesar el valor según el campo
    switch (field) {
      case 'price':
        processedValue = formatPrice(value);
        break;
      case 'stock':
        processedValue = formatStock(value);
        break;
      case 'title':
      case 'category':
      case 'description':
        processedValue = value.trimStart(); // Evitar espacios al inicio
        break;
      default:
        processedValue = value;
    }

    setter(prev => ({
      ...prev,
      [field]: processedValue
    }));
  }, [editando, nuevoProducto, formatPrice, formatStock]);

  // ------------------------------
  // FETCH PRODUCTOS
  // ------------------------------

  const fetchProductos = useCallback(async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "products"));
      const productosData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
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

  // ------------------------------
  // CRUD OPERATIONS
  // ------------------------------

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

      const nuevoProductoCompleto = {
        id: docRef.id,
        ...productoData,
      };

      setProductos(prev => [...prev, nuevoProductoCompleto]);
      
      // Resetear formulario
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

  const handleGuardarEdicion = useCallback(async (id) => {
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

      const ref = doc(db, "products", id);
      await updateDoc(ref, productoData);

      setProductos(prev =>
        prev.map(p => (p.id === id ? { ...p, ...productoData } : p))
      );

      toast.dismiss(loadingToast);
      toast.success(`Producto "${productoData.title}" actualizado exitosamente`);
      setEditando(null);
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      toast.error("Error al actualizar el producto. Inténtalo nuevamente.");
    }
  }, [editando, validarCampos]);

  const handleEliminar = useCallback(async (id) => {
    const producto = productos.find(p => p.id === id);
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
      setProductos(prev => prev.filter(p => p.id !== id));

      toast.dismiss(loadingToast);
      toast.success(`Producto "${producto.title}" eliminado exitosamente`);
      
      Swal.fire("Eliminado", "El producto ha sido eliminado.", "success");
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      toast.error("Error al eliminar el producto. Inténtalo nuevamente.");
    }
  }, [productos]);

  // ------------------------------
  // COMPONENTES DE FORMULARIO
  // ------------------------------

  const FormularioProducto = useMemo(() => ({ 
    producto, 
    onChange, 
    onSubmit, 
    submitText, 
    onCancel 
  }) => (
    <div className="form-producto">
      <input
        type="text"
        placeholder="Título"
        value={producto.title}
        onChange={(e) => onChange('title', e.target.value)}
        maxLength={100}
      />
      
      <input
        type="text"
        placeholder="Precio (solo números)"
        value={producto.price}
        onChange={(e) => onChange('price', e.target.value)}
        inputMode="decimal"
      />
      
      <input
        type="text"
        placeholder="Categoría"
        value={producto.category}
        onChange={(e) => onChange('category', e.target.value)}
        maxLength={50}
      />
      
      <input
        type="url"
        placeholder="URL de imagen"
        value={producto.image}
        onChange={(e) => onChange('image', e.target.value)}
      />
      
      <textarea
        placeholder="Descripción (mínimo 10 caracteres)"
        value={producto.description}
        onChange={(e) => onChange('description', e.target.value)}
        maxLength={500}
        rows={4}
      />
      
      <input
        type="text"
        placeholder="Stock (solo números enteros)"
        value={producto.stock}
        onChange={(e) => onChange('stock', e.target.value)}
        inputMode="numeric"
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
  ), []);

  // ------------------------------
  // RENDER
  // ------------------------------

  if (loading) {
    return (
      <div className="loader-container">
        <Loader />
      </div>
    );
  }

  return (
    <div className="products-admin">
      <h2>Gestión de Productos</h2>

      {/* FORMULARIO AGREGAR */}
      <div className="form-agregar">
        <h3>Agregar nuevo producto</h3>
        <FormularioProducto
          producto={nuevoProducto}
          onChange={(field, value) => handleInputChange(field, value, false)}
          onSubmit={handleAgregar}
          submitText="Agregar producto"
        />
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
                <FormularioProducto
                  producto={editando}
                  onChange={(field, value) => handleInputChange(field, value, true)}
                  onSubmit={() => handleGuardarEdicion(producto.id)}
                  onCancel={() => setEditando(null)}
                  submitText="Guardar"
                />
              ) : (
                <div className="producto-display">
                  <h4>{producto.title}</h4>
                  <p className="precio">${parseFloat(producto.price).toFixed(2)}</p>
                  <p className="categoria">{producto.category}</p>
                  <img 
                    src={producto.image} 
                    alt={producto.title} 
                    width={80}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <p className="descripcion">
                    {producto.description.length > 100 
                      ? `${producto.description.slice(0, 100)}...` 
                      : producto.description
                    }
                  </p>
                  <p className="rating">
                    ⭐ {producto.rating?.average || 0} ({producto.rating?.count || 0})
                  </p>
                  <p className="stock">Stock: {producto.stock}</p>
                  
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
      </div>
    </div>
  );
};

export default ProductsListAdmin;