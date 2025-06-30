import React, { useState } from "react";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaPaperPlane
} from "react-icons/fa";
import "./Contact.scss";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="hero-content">
          <h1>Contáctanos</h1>
          <p>Estamos para ayudarte. Escribinos y te responderemos a la brevedad.</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="contact-main">
        <div className="container">
          <div className="contact-grid">

            {/* Contact Form */}
            <div className="contact-form-section">
              <h2>Envíanos un mensaje</h2>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Nombre completo</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Correo electrónico</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Asunto</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="¿En qué podemos ayudarte?"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Mensaje</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="6"
                    placeholder="Escribí tu mensaje acá..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      Enviar mensaje
                    </>
                  )}
                </button>

                {submitStatus === 'success' && (
                  <div className="status-message success">
                    ¡Mensaje enviado con éxito! Te contactaremos pronto.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="status-message error">
                    Ocurrió un error al enviar tu mensaje. Intentalo de nuevo más tarde.
                  </div>
                )}
              </form>
            </div>

            {/* Contact Info */}
            <div className="contact-info-section">
              <h2>Información de contacto</h2>

              <div className="contact-cards">
                <div className="contact-card">
                  <div className="card-icon"><FaPhone /></div>
                  <div className="card-content">
                    <h3>Teléfono</h3>
                    <p>+54 11 1234 5678</p>
                    <p>+54 9 11 8765 4321</p>
                  </div>
                </div>

                <div className="contact-card">
                  <div className="card-icon"><FaEnvelope /></div>
                  <div className="card-content">
                    <h3>Email</h3>
                    <p>info@miempresa.com.ar</p>
                    <p>soporte@miempresa.com.ar</p>
                  </div>
                </div>

                <div className="contact-card">
                  <div className="card-icon"><FaMapMarkerAlt /></div>
                  <div className="card-content">
                    <h3>Dirección</h3>
                    <p>Av. Corrientes 1234</p>
                    <p>CABA, Buenos Aires, Argentina</p>
                  </div>
                </div>

                <div className="contact-card">
                  <div className="card-icon"><FaClock /></div>
                  <div className="card-content">
                    <h3>Horario de atención</h3>
                    <p>Lun a Vie: 9:00 a 18:00 hs</p>
                    <p>Sábados: 10:00 a 14:00 hs</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="social-section">
                <h3>Seguinos</h3>
                <div className="social-links">
                  <a href="#" className="social-link"><FaFacebook /></a>
                  <a href="#" className="social-link"><FaTwitter /></a>
                  <a href="#" className="social-link"><FaInstagram /></a>
                  <a href="#" className="social-link"><FaLinkedin /></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section">
        <div className="map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3282.500408186429!2d-58.41730958477038!3d-34.60373828046027!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccac48704fd27%3A0x2f3b3c61b70c19d7!2sAv.%20Corrientes%201234%2C%20C1043ABN%20CABA%2C%20Argentina!5e0!3m2!1ses!2sar!4v1718655000000"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación de la empresa"
          ></iframe>
        </div>
      </section>
    </div>
  );
}
