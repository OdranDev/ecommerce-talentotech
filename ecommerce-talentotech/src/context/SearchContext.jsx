import { createContext, useState, useContext } from "react";

const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [busqueda, setBusqueda] = useState("");

  const limpiarBusqueda = () => {
    setBusqueda("");
  };

  return (
    <SearchContext.Provider value={{ 
      busqueda, 
      setBusqueda, 
      limpiarBusqueda 
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch debe usarse dentro de un SearchProvider");
  }
  return context;
}