import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import './Login.scss';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'El correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'El correo no es válido';

    if (!password) newErrors.password = 'La contraseña es requerida';
    else if (password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Inicio de sesión exitoso');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) return toast.error('Ingresa tu correo para restablecer la contraseña');
    try {
      await resetPassword(resetEmail);
      toast.success('Correo de restablecimiento enviado');
      setShowReset(false);
    } catch (err) {
      toast.error(err.message || 'Error al enviar el correo');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Iniciar Sesión</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group has-icon">
            <div className="input-icon"><FaEnvelope /></div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className={errors.password ? 'error' : ''}
              disabled={loading}
            />
          </div>
          {errors.password && <div className="message error">{errors.password}</div>}

          <div className="forgot-password">
            <button type="button" onClick={() => setShowReset(!showReset)}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {showReset && (
            <div className="reset-password">
              <input
                type="email"
                placeholder="Ingresa tu correo"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
              <button type="button" className="btn-secondary" onClick={handlePasswordReset}>
                Enviar correo de restablecimiento
              </button>
            </div>
          )}

          <button
            type="submit"
            className={`btn-primary ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Iniciando...' : 'Ingresar'}
          </button>
        </form>

        <div className="divider"></div>
        <div className='notienesunacuenta'>¿No tienes cuenta?</div>

        <div className="register-link">
          <p>Crea una cuenta nueva</p>
          <Link to="/register">Registrarse</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
