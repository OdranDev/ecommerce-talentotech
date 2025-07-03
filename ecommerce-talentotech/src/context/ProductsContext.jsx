import React, { createContext, useState, useContext } from "react";

export const ProductsContext = createContext();

export const ProductsProvider = ({ children }) => {
  const [votedProducts, setVotedProducts] = useState([]);

  const addVotedProduct = (product, rating) => {
    setVotedProducts((prev) => {
      const alreadyVoted = prev.find((p) => p.id === product.id);
      if (alreadyVoted) {
        // actualiza la calificación si ya existe
        return prev.map((p) =>
          p.id === product.id ? { ...p, rating } : p
        );
      }
      return [...prev, { ...product, rating }];
    });
  };

  return (
    <ProductsContext.Provider value={{ votedProducts, addVotedProduct }}>
      {children}
    </ProductsContext.Provider>
  );
};

// Hook personalizado
export const useProducts = () => useContext(ProductsContext);
