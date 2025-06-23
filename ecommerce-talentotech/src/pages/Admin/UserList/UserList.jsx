import { useEffect, useState } from "react";
import { db } from "../../../auth/Firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { Link } from "react-router-dom";

function UserList() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const usersData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUsers(usersData);
  };

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    await updateDoc(doc(db, "users", userId), { role: newRole });
    fetchUsers(); // refresh
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <Link to="/admin">
        <button>Volver</button>
      </Link>
      <h2>Gestión de Usuarios</h2>
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
            <tr key={u.id}>
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
  );
}

export default UserList;
