import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import Products from "./pages/Products/Products";
import ProductDetail from "./pages/Products/ProductDetail";
import Cart from "./pages/Cart/Cart";
import Profile from "./pages/Profile/Profile";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import NotFound from "./pages/NotFound/NotFound";
import Unauthorized from "./pages/Unauthorized/Unauthorized";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login/Login";
import Contact from "./pages/Contact/Contact";
import Register from "./pages/Register/Register";
import RequireAdmin from "./components/RequireAdmin/RequireAdmin"; // ✅ Importación del nuevo guardia
import "./App.css";

function App() {
  return (
    <div className="App-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/contact" element={<Contact />} />

          {/* Rutas públicas - solo accesibles si NO está autenticado */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Ruta protegida para CLIENTE */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute rolesPermitidos={["cliente"]}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Ruta protegida para ADMIN con lógica avanzada */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />

          {/* Acceso denegado */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Página no encontrada */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        <ToastContainer position="top-right" autoClose={3000} />
      </main>
      <Footer />
    </div>
  );
}

export default App;
