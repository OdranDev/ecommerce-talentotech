import { useEffect, useState } from "react";
import { db } from "../../../auth/Firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import useUser from "../../../hooks/useUser";
import "./UserList.scss";
import Loader from "../../../components/loader/Loader";

const USERS_PER_PAGE = 5;

function UserList() {
  const [users, setUsers] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [firstVisible, setFirstVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageStack, setPageStack] = useState([]); // para retroceder
  const { user } = useUser();

  const fetchUsers = async (direction = "next") => {
    try {
      setLoading(true);
      let q = query(collection(db, "users"), orderBy("email"), limit(USERS_PER_PAGE));

      if (direction === "next" && lastVisible) {
        q = query(q, startAfter(lastVisible));
      } else if (direction === "prev" && pageStack.length > 1) {
        const previous = pageStack[pageStack.length - 2];
        q = query(collection(db, "users"), orderBy("email"), startAfter(previous), limit(USERS_PER_PAGE));
      }

      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;

      if (docs.length > 0) {
        setUsers(docs.map(doc => ({ id: doc.id, ...doc.data() })));

        setFirstVisible(docs[0]);
        setLastVisible(docs[docs.length - 1]);

        if (direction === "next") {
          setPageStack(prev => [...prev, docs[0]]);
        } else if (direction === "prev") {
          setPageStack(prev => prev.slice(0, -1));
        }
      } else {
        toast.info("No hay más usuarios.");
      }
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
        fetchUsers("refresh");
      } catch (err) {
        toast.error("Error al actualizar el rol");
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <Link to="/admin">
          <button className="btn-back">← Volver</button>
        </Link>
        <h2>👥 Gestión de Usuarios</h2>
      </div>

      {loading ? (
        <div className="loader-container" style={{ minHeight: "300px" }}>
          <Loader />
          <p>Cargando usuarios...</p>
        </div>
      ) : (
        <>
          <div className="user-table">
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

          <div className="pagination-controls">
            <button
              disabled={pageStack.length <= 1}
              onClick={() => fetchUsers("prev")}
            >
              ← Anterior
            </button>
            <button onClick={() => fetchUsers("next")}>Siguiente →</button>
          </div>
        </>
      )}
    </div>
  );
}

export default UserList;
