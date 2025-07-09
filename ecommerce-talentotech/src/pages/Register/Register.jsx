import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaKey } from 'react-icons/fa';
import './Register.scss';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'password') {
      evaluatePasswordStrength(value);
    }
  };

  const evaluatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    if (strength <= 2) setPasswordStrength('weak');
    else if (strength <= 4) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.email) newErrors.email = 'El correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'El correo no es válido';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    else if (formData.password.length < 8) newErrors.password = 'Debe tener al menos 8 caracteres';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirma tu contraseña';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    if (!acceptedTerms) newErrors.terms = 'Debes aceptar los términos';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      // 🔹 Pasar los datos del usuario a la función register
      const userCredential = await register(
        formData.email, 
        formData.password, 
        {
          fullName: formData.name, // 🔹 Pasar el nombre como fullName
          comment: '', // 🔹 Puedes agregar un campo de comentario si lo necesitas
          // Puedes agregar más campos aquí si los necesitas
        }
      );

      toast.success('¡Registro exitoso! Bienvenido');
      navigate('/');
    } catch (err) {
      console.error('Error en registro:', err); // 🔹 Para debugging
      toast.error(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 'weak': return 'Débil';
      case 'medium': return 'Media';
      case 'strong': return 'Fuerte';
      default: return '';
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2>Crear Cuenta</h2>

        <div className="features-list animate-fade-in">
          <h3>¿Por qué registrarte?</h3>
          <ul>
            <li>Acceso completo a todas las funcionalidades</li>
            <li>Sincronización en la nube</li>
            <li>Soporte prioritario</li>
            <li>Actualizaciones automáticas</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group has-icon">
            <div className="input-icon"><FaUser /></div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nombre completo"
              className={errors.name ? 'error' : ''}
              disabled={loading}
            />
          </div>
          {errors.name && <div className="message error">{errors.name}</div>}

          <div className="input-group has-icon">
            <div className="input-icon"><FaEnvelope /></div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Correo electrónico"
              className={errors.email ? 'error' : ''}
              disabled={loading}
            />
          </div>
          {errors.email && <div className="message error">{errors.email}</div>}

          <div className="input-group has-icon">
            <div className="input-icon"><FaLock /></div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Contraseña"
              className={errors.password ? 'error' : ''}
              disabled={loading}
            />
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div className={`strength-fill ${passwordStrength}`}></div>
                </div>
                <div className={`strength-text ${passwordStrength}`}>
                  {getPasswordStrengthText()}
                </div>
              </div>
            )}
          </div>
          {errors.password && <div className="message error">{errors.password}</div>}

          <div className="input-group has-icon">
            <div className="input-icon"><FaKey /></div>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirmar contraseña"
              className={errors.confirmPassword ? 'error' : ''}
              disabled={loading}
            />
          </div>
          {errors.confirmPassword && <div className="message error">{errors.confirmPassword}</div>}

          <div className="terms-checkbox">
            <input
              type="checkbox"
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              disabled={loading}
            />
            <label htmlFor="terms">
              Acepto los <a href="/terms" target="_blank">términos y condiciones</a> y la <a href="/privacy" target="_blank">política de privacidad</a>
            </label>
          </div>
          {errors.terms && <div className="message error">{errors.terms}</div>}

          <button
            type="submit"
            className={`btn-primary ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="divider">
          <span>¿Ya tienes una cuenta?</span>
        </div>

        <div className="login-link">
          <p>Accede a tu cuenta existente</p>
          <Link to="/login">Iniciar Sesión</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;