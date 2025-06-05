import React from 'react';
import './ProductSlider.scss';

export default function ProductSlider() {
  // Aquí pondrás los productos reales o simulados
  const products = [
    { id: 1, name: 'Smartwatch X1', image: 'https://via.placeholder.com/150' },
    { id: 2, name: 'Auriculares Pro', image: 'https://via.placeholder.com/150' },
    { id: 3, name: 'Mini Drone', image: 'https://via.placeholder.com/150' },
    { id: 4, name: 'Teclado Gamer', image: 'https://via.placeholder.com/150' },
  ];

  return (
    <div className="slider">
      {products.map(product => (
        <div className="slide" key={product.id}>
          <img src={product.image} alt={product.name} />
          <p>{product.name}</p>
        </div>
      ))}
    </div>
  );
}
