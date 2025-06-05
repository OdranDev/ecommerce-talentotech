import React from "react";
import './Testimonials.scss';

export default function Testimonials() {
  const feedback = [
    { id: 1, name: 'Ana López', comment: 'Increíble calidad y servicio. Mi negocio ha mejorado mucho.' },
    { id: 2, name: 'Carlos Rivera', comment: 'La atención al cliente fue excelente y el producto llegó muy rápido.' },
    { id: 3, name: 'Sofía Gómez', comment: 'Los recomiendo al 100%. Productos modernos y eficientes.' },
  ];

  return (
    <div className="testimonials-container">
      {feedback.map(testimonial => (
        <div className="testimonial" key={testimonial.id}>
          <p>“{testimonial.comment}”</p>
          <h4>- {testimonial.name}</h4>
        </div>
      ))}
    </div>
  );
}
