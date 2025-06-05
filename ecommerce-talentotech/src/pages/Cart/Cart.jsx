import React, { useContext } from "react";
import { CartContext } from "../../context/CartContext";

function Cart() {
  const { cartItems, removeFromCart, clearCart } = useContext(CartContext);

  if (cartItems.length === 0) return <p>Tu carrito está vacío.</p>;

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div>
      <h2>Tu Carrito</h2>
      <ul>
        {cartItems.map((item) => (
          <li key={item.id}>
            <img src={item.image} alt={item.title} width={40} />
            {item.title} - ${item.price} x {item.quantity}
            <button onClick={() => removeFromCart(item.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
      <p><strong>Total: ${total.toFixed(2)}</strong></p>
      <button onClick={clearCart}>Vaciar carrito</button>
    </div>
  );
}

export default Cart;

