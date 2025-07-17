import { useEffect, useState } from "react";
import { db } from "../../../auth/Firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import useUser from "../../../hooks/useUser";
import "./UserList.scss";
import Loader from "../../../components/loader/Loader";

const USERS_PER_PAGE = 12;

function UserList() {
  const [users, setUsers] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [usuariosTotales, setUsuariosTotales] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const totalPaginas = Math.ceil(usuariosTotales / USERS_PER_PAGE);

  const fetchUsers = async (pagina = 1) => {
    try {
      setLoading(true);

      const q = query(collection(db, "users"), orderBy("email"));
      const snapshot = await getDocs(q);
      const allUsers = snapshot.docs;

      const startIndex = (pagina - 1) * USERS_PER_PAGE;
      const endIndex = startIndex + USERS_PER_PAGE;
      const currentUsers = allUsers.slice(startIndex, endIndex);

      setUsers(currentUsers.map(doc => ({ id: doc.id, ...doc.data() })));
      setUsuariosTotales(allUsers.length);
      setPaginaActual(pagina);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";

    const confirm = await Swal.fire({
      title: `¿Cambiar a ${newRole}?`,
      text: "¿Estás seguro de cambiar el rol de este usuario?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cambiar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      try {
        await updateDoc(doc(db, "users", userId), { role: newRole });
        toast.success("Rol actualizado correctamente");
        fetchUsers(paginaActual);
      } catch (err) {
        toast.error("Error al actualizar el rol");
      }
    }
  };

  const irAPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      fetchUsers(pagina);
    }
  };

  const irAPaginaAnterior = () => {
    if (paginaActual > 1) {
      fetchUsers(paginaActual - 1);
    }
  };

  const irAPaginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      fetchUsers(paginaActual + 1);
    }
  };

  const generarNumerosPaginas = () => {
    const pages = [];
    const start = Math.max(1, paginaActual - 2);
    const end = Math.min(totalPaginas, paginaActual + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <Link to="/admin">
          <button className="btn-back">← Volver</button>
        </Link>
        <h2>👥 Gestión de Usuarios</h2>
        <h3 className="totalUsuarios">
          Cantidad de usuarios registrados ({usuariosTotales})
        </h3>
      </div>

      {loading ? (
        <div className="loader-container" style={{ minHeight: "300px" }}>
          <Loader />
        </div>
      ) : (
        <>
          <div className="user-table">
            {/* Tabla para escritorio */}
            <div className="table-desktop">
              <table>
                <thead>
                  <tr>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className={u.email === user?.email ? "current-user" : ""}
                    >
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>
                        <button onClick={() => toggleRole(u.id, u.role)}>
                          Cambiar a {u.role === "admin" ? "user" : "admin"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards para móvil */}
            <div className="table-mobile">
              {users.map((u) => (
                <div
                  key={u.id}
                  className={`user-card ${u.email === user?.email ? "current-user" : ""}`}
                >
                  <p><strong>Correo:</strong> {u.email}</p>
                  <p><strong>Rol:</strong> {u.role}</p>
                  <button onClick={() => toggleRole(u.id, u.role)}>
                    Cambiar a {u.role === "admin" ? "user" : "admin"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Controles de paginación */}
          {totalPaginas > 1 && (
            <div className="pagination-controls">
              <button
                disabled={paginaActual <= 1}
                onClick={irAPaginaAnterior}
                className="pagination-btn"
              >
                ← Anterior
              </button>

              <div className="pagination-numbers">
                {paginaActual > 3 && (
                  <>
                    <button
                      onClick={() => irAPagina(1)}
                      className="pagination-number"
                    >
                      1
                    </button>
                    {paginaActual > 4 && <span className="pagination-dots">...</span>}
                  </>
                )}

                {generarNumerosPaginas().map((numero) => (
                  <button
                    key={numero}
                    onClick={() => irAPagina(numero)}
                    className={`pagination-number ${
                      numero === paginaActual ? "active" : ""
                    }`}
                  >
                    {numero}
                  </button>
                ))}

                {paginaActual < totalPaginas - 2 && (
                  <>
                    {paginaActual < totalPaginas - 3 && (
                      <span className="pagination-dots">...</span>
                    )}
                    <button
                      onClick={() => irAPagina(totalPaginas)}
                      className="pagination-number"
                    >
                      {totalPaginas}
                    </button>
                  </>
                )}
              </div>

              <button
                disabled={paginaActual >= totalPaginas}
                onClick={irAPaginaSiguiente}
                className="pagination-btn"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default UserList;
