import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../auth/Firebase";
import Loader from "../../components/loader/Loader";
import Testimonials from "./Testimonials";
import "./Home.scss";

const Home = () => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductos = async () => {
      setCargando(true);
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
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

  // ✅ Filtrar y ordenar por promedio de calificación (`rating.average`)
  const topProductos = productos
    .filter((p) => p.rating?.average && p.rating.count >= 1)
    .sort((a, b) => b.rating.average - a.rating.average)
    .slice(0, 8);

  if (cargando) {
    return (
      <div className="home">
        <section className="hero">
          <div className="hero-content">
            <h1>TalentoTech Shop</h1>
            <p>Productos inteligentes.</p>
            <Link to="/products">
              <button className="cta-button">Ver productos</button>
            </Link>
          </div>
        </section>
        <h2>🏆 Productos Mejor Calificados</h2>
        <Loader />
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (error) return <p className="error">{error}</p>;

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
        {topProductos.length > 0 ? (
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              480: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
              1200: { slidesPerView: 5 },
            }}
            navigation
            pagination={{ clickable: true }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            loop={topProductos.length > 4}
            speed={900}
            className="product-slider"
          >
            {topProductos.map((producto) => (
              <SwiperSlide key={producto.id}>
                <Link to={`/products/${producto.id}`} className="slider-card">
                  <img src={producto.image} alt={producto.title} />
                  <h4>{producto.title.slice(0, 30)}...</h4>
                  <p>
                    ⭐ {producto.rating?.average?.toFixed(1) || 0} (${producto.price})
                  </p>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p>No hay productos con calificación suficiente.</p>
        )}
      </section>

      {/* TESTIMONIOS */}
      <section className="testimonials">
        <h2>Lo que dicen nuestros clientes</h2>
        <Testimonials />
      </section>
    </div>
  );
};

export default Home;
