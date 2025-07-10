import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../auth/Firebase';
import './Testimonials.scss';

export default function Testimonials() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const snapshot = await getDocs(collection(db, "users"));
        const data = snapshot.docs
          .map(doc => {
            const docData = doc.data();
            
            // Manejar correctamente las fechas de Firebase
            let date = new Date(); // fecha por defecto
            if (docData.createdAt) {
              // Si es un Timestamp de Firebase
              if (docData.createdAt.toDate) {
                date = docData.createdAt.toDate();
              } 
              // Si es un string o número que se puede convertir
              else if (typeof docData.createdAt === 'string' || typeof docData.createdAt === 'number') {
                const parsedDate = new Date(docData.createdAt);
                if (!isNaN(parsedDate.getTime())) {
                  date = parsedDate;
                }
              }
              // Si ya es un objeto Date válido
              else if (docData.createdAt instanceof Date && !isNaN(docData.createdAt.getTime())) {
                date = docData.createdAt;
              }
            }

            return {
              id: doc.id,
              name: docData.fullName,
              comment: docData.comment,
              avatar: docData.avatar || null,
              rating: docData.rating || 5,
              location: docData.location || null,
              date: date
            };
          })
          .filter(item => item.comment && item.name) // Solo mostrar testimonios con comentario y nombre
          .sort((a, b) => new Date(b.date) - new Date(a.date)); // Ordenar por fecha más reciente
        
        setFeedback(data);
      } catch (error) {
        console.error("Error al obtener testimonios:", error);
        setError("Error al cargar los testimonios. Por favor, intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  // Auto-scroll para carousel en mobile
  useEffect(() => {
    if (feedback.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % feedback.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [feedback.length]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>
        ⭐
      </span>
    ));
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date) => {
    // Validación adicional para asegurar que la fecha es válida
    if (!date || isNaN(new Date(date).getTime())) {
      return 'Reciente'; // Texto por defecto si la fecha no es válida
    }
    
    try {
      return new Date(date).toLocaleDateString('es-ES', {
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Reciente';
    }
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % feedback.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + feedback.length) % feedback.length);
  };

  if (loading) {
    return (
      <section className="testimonials-container">
        <div className="container">
          <h2 className="section-title">Lo que dicen nuestros clientes</h2>
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Cargando testimonios...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="testimonials-container">
        <div className="container">
          <h2 className="section-title">Lo que dicen nuestros clientes</h2>
          <div className="error-container">
            <p className="error-text">{error}</p>
            <button 
              className="retry-btn"
              onClick={() => window.location.reload()}
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (feedback.length === 0) {
    return (
      <section className="testimonials-container">
        <div className="container">
          <h2 className="section-title">Lo que dicen nuestros clientes</h2>
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p className="empty-text">Próximamente verás aquí los testimonios de nuestros clientes.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="testimonials-container">
      <div className="container">
        <div className="testimonials-header">
          <h2 className="section-title">Lo que dicen nuestros clientes</h2>
          <p className="section-subtitle">
            Descubre por qué más de {feedback.length} personas confían en nosotros
          </p>
        </div>

        {/* Vista Desktop - Grid */}
        <div className="testimonials-grid desktop-view">
          {feedback.map(({ id, comment, name, avatar, rating, location, date }) => (
            <article className="testimonial" key={id}>
              <div className="testimonial-header">
                <div className="user-info">
                  <div className="avatar">
                    {avatar ? (
                      <img src={avatar} alt={name} />
                    ) : (
                      <span className="initials">{getInitials(name)}</span>
                    )}
                  </div>
                  <div className="user-details">
                    <h4 className="author">{name}</h4>
                    {location && <p className="location">{location}</p>}
                    <p className="date">{formatDate(date)}</p>
                  </div>
                </div>
                <div className="rating">
                  {renderStars(rating)}
                </div>
              </div>
              
              <blockquote className="comment">
                "{comment}"
              </blockquote>
            </article>
          ))}
        </div>

        {/* Vista Mobile - Carousel */}
        <div className="testimonials-carousel mobile-view">
          <div className="carousel-container">
            <button 
              className="carousel-btn prev" 
              onClick={prevTestimonial}
              aria-label="Testimonio anterior"
            >
              ❮
            </button>
            
            <div className="carousel-track">
              {feedback.map(({ id, comment, name, avatar, rating, location, date }, index) => (
                <article 
                  className={`testimonial ${index === currentIndex ? 'active' : ''}`}
                  key={id}
                >
                  <div className="testimonial-header">
                    <div className="user-info">
                      <div className="avatar">
                        {avatar ? (
                          <img src={avatar} alt={name} />
                        ) : (
                          <span className="initials">{getInitials(name)}</span>
                        )}
                      </div>
                      <div className="user-details">
                        <h4 className="author">{name}</h4>
                        {location && <p className="location">{location}</p>}
                        <p className="date">{formatDate(date)}</p>
                      </div>
                    </div>
                    <div className="rating">
                      {renderStars(rating)}
                    </div>
                  </div>
                  
                  <blockquote className="comment">
                    "{comment}"
                  </blockquote>
                </article>
              ))}
            </div>
            
            <button 
              className="carousel-btn next" 
              onClick={nextTestimonial}
              aria-label="Siguiente testimonio"
            >
              ❯
            </button>
          </div>
          
          <div className="carousel-indicators">
            {feedback.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Ir al testimonio ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}