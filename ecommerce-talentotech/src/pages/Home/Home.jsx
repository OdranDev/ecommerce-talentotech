import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../auth/Firebase";
import Loader from "../../components/loader/Loader";
import Testimonials from "../Testimonials/Testimonials";
import { GlobalContext } from "../../context/GlobalContext";
import "./Home.scss";

const Home = () => {
  const { titulo } = useContext(GlobalContext);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductos = async () => {
      setCargando(true);
      try {
        const q = query(
          collection(db, "products"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);

        const productosData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProductos(productosData);
        setError(null);
      } catch (err) {
        console.error("Error al obtener productos de Firestore:", err);
        setError("No se pudieron cargar los productos.");
      } finally {
        setCargando(false);
      }
    };

    fetchProductos();
  }, []);

  // Filtrar y ordenar por promedio de calificación
  const topProductos = productos
    .filter((p) => p.rating?.average && p.rating.count >= 1)
    .sort((a, b) => b.rating.average - a.rating.average)
    .slice(0, 8);

  if (cargando) {
    return (
      <div className="home" style={{ minHeight: "600px" }}>
        <section className="hero">
          <div className="hero-content">
            <h1>{titulo}</h1>
            <p className="hero-subtitle">
              Productos inteligentes que transforman tu experiencia
            </p>
            <Link to="/products" className="cta-button" tabIndex="-1">
              <button className="btn-primary" disabled>
                Ver productos
              </button>
            </Link>
          </div>
        </section>

        <section className="featured-products">
          <div className="container">
            <h2 className="section-title">
              <span className="title-icon" role="img" aria-label="Trofeo">
                🏆
              </span>
              Productos Mejor Calificados
            </h2>
            <Loader />
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home">
        <div className="error-container">
          <div className="error-content">
            <h2>¡Oops! Algo salió mal</h2>
            <p className="error-message">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      {/* HERO SECTION */}
      <section className="hero" role="banner">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">{titulo}</h1>
          <p className="hero-subtitle">
            Branding, diseño y productos inteligentes que potencian tu negocio
          </p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">{productos.length}+</span>
              <span className="stat-label">Productos</span>
            </div>
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Clientes</span>
            </div>
            <div className="stat">
              <span className="stat-number">4.8</span>
              <span className="stat-label">Valoración</span>
            </div>
          </div>
          <div className="hero-actions">
            <Link to="/products" className="btn-primary">
              Explorar productos
            </Link>
            <Link to="/about" className="btn-secondary">
              Conoce más
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS SECTION */}
      <section
        className="featured-products"
        role="region"
        aria-label="Productos destacados"
      >
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-icon" role="img" aria-label="Trofeo">
                🏆
              </span>
              Productos Mejor Calificados
            </h2>
            <p className="section-subtitle">
              Descubre los productos favoritos de nuestra comunidad
            </p>
          </div>

          {topProductos.length > 0 ? (
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{
                480: { slidesPerView: 2, spaceBetween: 16 },
                768: { slidesPerView: 3, spaceBetween: 20 },
                1024: { slidesPerView: 4, spaceBetween: 24 },
                1200: { slidesPerView: 5, spaceBetween: 24 },
              }}
              navigation={{
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
              }}
              pagination={{
                clickable: true,
                el: ".swiper-pagination",
              }}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={topProductos.length > 4}
              speed={600}
              className="product-slider"
              a11y={{
                prevSlideMessage: "Producto anterior",
                nextSlideMessage: "Producto siguiente",
              }}
            >
              {topProductos.map((producto) => (
                <SwiperSlide key={producto.id}>
                  <article className="product-card">
                    <Link
                      to={`/products/${producto.id}`}
                      className="product-link"
                      aria-label={`Ver detalles de ${producto.title}`}
                    >
                      <div className="product-image-container">
                        <img
                          src={producto.image}
                          alt={producto.title}
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = "/placeholder-image.jpg";
                          }}
                        />
                        <div className="product-badge">
                          <span className="badge-text">Destacado</span>
                        </div>
                      </div>
                      <div className="product-info">
                        <h3 className="product-title">
                          {producto.title.length > 35
                            ? `${producto.title.slice(0, 35)}...`
                            : producto.title}
                        </h3>
                        <div className="product-rating">
                          <span
                            className="rating-stars"
                            aria-label={`${
                              producto.rating?.average || 0
                            } estrellas`}
                          >
                            {"⭐".repeat(
                              Math.round(producto.rating?.average || 0)
                            )}
                          </span>
                          <span className="rating-text">
                            {producto.rating?.average?.toFixed(1) || 0}
                          </span>
                          <span className="rating-count">
                            ({producto.rating?.count || 0})
                          </span>
                        </div>
                        <div className="product-price">${producto.price}</div>
                      </div>
                    </Link>
                  </article>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="no-products">
              <div className="no-products-icon">📦</div>
              <h3>No hay productos disponibles</h3>
              <p>Pronto agregaremos productos increíbles para ti.</p>
            </div>
          )}

          {/* Navigation buttons */}
          <div
            className="swiper-button-prev"
            aria-label="Producto anterior"
            style={{ left: 0 }}
          ></div>
          <div
            className="swiper-button-next"
            aria-label="Producto siguiente"
            style={{ right: 0 }}
          ></div>
          <div className="swiper-pagination"></div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features" role="region" aria-label="Características">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">¿Por qué elegirnos?</h2>
            <p className="section-subtitle">
              Ofrecemos la mejor experiencia en productos inteligentes
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Entrega Rápida</h3>
              <p>Entrega en menos de 24 horas en área metropolitana</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Garantía Total</h3>
              <p>30 días de garantía en todos nuestros productos</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💎</div>
              <h3>Calidad Premium</h3>
              <p>Productos seleccionados con los más altos estándares</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Soporte 24/7</h3>
              <p>Asistencia técnica especializada cuando la necesites</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <Testimonials />

      {/* CTA SECTION */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>¿Listo para comenzar?</h2>
            <p>
              Únete a miles de clientes satisfechos que ya confían en nosotros
            </p>
            <div className="cta-actions">
              <Link to="/products" className="btn-primary btn-large">
                Ver todos los productos
              </Link>
              <Link to="/contact" className="btn-secondary btn-large">
                Contáctanos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
