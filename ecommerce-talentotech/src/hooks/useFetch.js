import { useEffect, useState } from "react";

const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    const obtenerDatos = async () => {
      try {
        const respuesta = await fetch(url);
        if (!respuesta.ok) throw new Error("Error en la petición");
        const resultado = await respuesta.json();

        if (!isCancelled) {
          setData(resultado);
          setCargando(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setError("Hubo un problema al cargar los datos.");
          setCargando(false);
        }
      }
    };

    obtenerDatos();

    return () => {
      isCancelled = true; // evita actualizaciones si el componente se desmonta
    };
  }, [url]);

  return { data, cargando, error };
};

export default useFetch;
