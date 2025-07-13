import React from "react";
import { useSearch } from "../../../context/SearchContext";
import { BsSearch, BsX } from "react-icons/bs";
import './SearchProducts.scss'

export default function SearchProducts() {
  const { busqueda, setBusqueda } = useSearch();

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
  };

  const limpiarBusqueda = () => {
    setBusqueda("");
  };

  return (
    <div className="search-products">
      <div className="search-input-container">
        <BsSearch className="search-icon" />
        <input
          type="text"
          placeholder="Buscar productos..."
          className="search-input"
          value={busqueda}
          onChange={handleBusquedaChange}
        />
        {busqueda && (
          <button
            type="button"
            onClick={limpiarBusqueda}
            className="clear-search-btn"
            aria-label="Limpiar búsqueda"
          >
            <BsX />
          </button>
        )}
      </div>
      
      {busqueda && (
        <div className="search-indicator">
          <p>
            Buscando: <strong>"{busqueda}"</strong>
            <button
              type="button"
              onClick={limpiarBusqueda}
              className="clear-search-link"
            >
              Limpiar
            </button>
          </p>
        </div>
      )}
    </div>
  );
}