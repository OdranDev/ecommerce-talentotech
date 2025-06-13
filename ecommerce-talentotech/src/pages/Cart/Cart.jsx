import React, { useContext, useState } from "react";
import { CartContext } from "../../context/CartContext";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Cart.scss";
import { Link } from "react-router-dom";

function Cart() {
  const { cartItems, removeFromCart, clearCart, updateQuantity } =
    useContext(CartContext);

  const [removingItemIds, setRemovingItemIds] = useState([]);
  const [isClearingAll, setIsClearingAll] = useState(false);

  if (cartItems.length === 0) {
  return (
    <div className="cart-empty">
      <section className="empty-state">
        <h2>Tu carrito está vacío</h2>
        <p>¡Explora nuestros productos y encuentra lo que más te gusta!</p>
        <Link to="/products">
          <button className="cta-button">Ver productos</button>
        </Link>
      </section>
    </div>
  );
}


  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleIncrease = (item) => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrease = (item) => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    } else {
      confirmRemove(item.id);
    }
  };

  const confirmRemove = (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el producto del carrito.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        handleRemove(id);
        toast.success("Producto eliminado con éxito");
      }
    });
  };

  const handleRemove = (id) => {
    setRemovingItemIds((prev) => [...prev, id]);
    setTimeout(() => {
      removeFromCart(id);
      setRemovingItemIds((prev) => prev.filter((itemId) => itemId !== id));
    }, 600);
  };

  const handleClearAll = () => {
    Swal.fire({
      title: "¿Vaciar carrito?",
      text: "Esta acción eliminará todos los productos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#198754",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, vaciar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        setIsClearingAll(true);
        setRemovingItemIds(cartItems.map((item) => item.id));

        setTimeout(() => {
          clearCart();
          setRemovingItemIds([]);
          setIsClearingAll(false);
        }, 2000);

        toast.success("Carrito vaciado con éxito");
      }
    });
  };

  return (
    <div className="cart-container">
      <h2>Tu Carrito</h2>
      <p className="total">Total: ${total.toFixed(2)}</p>
      <ul className="cart-items">
        {cartItems.map((item) => (
          <li
            key={item.id}
            className={removingItemIds.includes(item.id) ? "removing" : ""}
          >
            <img src={item.image} alt={item.title} />
            <div className="item-info">
              <strong>{item.title}</strong>
              <div className="qty-row">
                <span>${item.price} x</span>
                <button
                  className="qty-btn"
                  onClick={() => {
                    if (item.quantity > 1) {
                      handleDecrease(item);
                    } else {
                      confirmRemove(item.id);
                    }
                  }}
                  disabled={isClearingAll}
                >
                  <AiOutlineMinus />
                </button>
                <span>{item.quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => handleIncrease(item)}
                  disabled={isClearingAll}
                >
                  <AiOutlinePlus />
                </button>
                <span className="subtotal">
                  Subtotal: ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
            <button
              className="remove-btn"
              onClick={() => confirmRemove(item.id)}
              disabled={isClearingAll}
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
      <button
        className="clear-cart-btn"
        onClick={handleClearAll}
        disabled={isClearingAll}
      >
        Vaciar carrito
      </button>

      <ToastContainer position="top-right" autoClose={1500} />
    </div>
  );
}

export default Cart;
