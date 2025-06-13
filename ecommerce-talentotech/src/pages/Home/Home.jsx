import React from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Loader from "../../components/loader/Loader";
import Testimonials from "./Testimonials";
import "./Home.scss";
import useFetch from "../../hooks/useFetch";

function Home() {
  const { data, cargando, error } = useFetch("https://fakestoreapi.com/products");

  const topProductos = data
    ? [...data].sort((a, b) => b.rating.rate - a.rating.rate).slice(0, 12)
    : [];

  if (cargando) {
    return (
      <div className="home">
        <section className="hero">
          <div className="hero-content">
            <h1>TalentoTech Shop</h1>
            <p>Branding, diseño y productos inteligentes.</p>
            <Link to="/products">
              <button className="cta-button">Ver productos</button>
            </Link>
          </div>
        </section>
        <Loader />
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (error) return <p>{error}</p>;

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <h1>TalentoTech Shop</h1>
          <p>Branding, diseño y productos inteligentes.</p>
          <Link to="/products">
            <button className="cta-button">Ver productos</button>
          </Link>
        </div>
      </section>

      {/* SLIDER */}
      <section className="featured-products">
        <h2>🏆 Productos Mejor Calificados</h2>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            480: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          navigation
          pagination={{ clickable: true }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          loop={topProductos.length > 4}
          loopedslides={topProductos.length}
          speed={900}
          className="product-slider"
        >
          {topProductos.map((producto) => (
            <SwiperSlide key={producto.id}>
              <Link to={`/products/${producto.id}`} className="slider-card">
                <img src={producto.image} alt={producto.title} />
                <h4>{producto.title.slice(0, 40)}...</h4>
                <p>
                  ⭐ {producto.rating.rate} (${producto.price})
                </p>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* TESTIMONIOS */}
      <section className="testimonials">
        <h2>Lo que dicen nuestros clientes</h2>
        <Testimonials />
      </section>
    </div>
  );
}

export default Home;
