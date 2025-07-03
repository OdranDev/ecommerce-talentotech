import { useEffect, useState } from "react";
import { db } from "../../../auth/Firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import useUser from "../../../hooks/useUser";
import "./UserList.scss";
import Loader from "../../../components/loader/Loader";

function UserList() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { user } = useUser(); // usuario autenticado

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
      setFiltered(usersData);
    } catch (error) {
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
        fetchUsers();
      } catch (err) {
        toast.error("Error al actualizar el rol");
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let results = [...users];

    if (filter !== "all") {
      results = results.filter((u) => u.role === filter);
    }

    if (search.trim() !== "") {
      results = results.filter((u) =>
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(results);
  }, [filter, search, users]);

  if (loading) {
    return (
      <div className="loader-container" style={{ minHeight: "300px" }}>
        <Loader />
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <Link to="/admin">
          <button className="btn-back">← Volver</button>
        </Link>
        <h2>👥 Gestión de Usuarios</h2>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Buscar por correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Todos</option>
          <option value="admin">Admins</option>
          <option value="user">Usuarios</option>
        </select>
      </div>

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
              {filtered.map((u) => (
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
          {filtered.map((u) => (
            <div
              key={u.id}
              className={`user-card ${
                u.email === user?.email ? "current-user" : ""
              }`}
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
    </div>
  );
}

export default UserList;
