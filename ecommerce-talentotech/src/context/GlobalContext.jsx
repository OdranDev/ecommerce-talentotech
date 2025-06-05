import { createContext, useContext, useState } from "react";

export const GlobalContext = createContext()

export default function GlobalProvider({children}){
    const [titulo, setTitulo] = useState("TalentoTech Shop")
    return(
        <GlobalContext.Provider value={{titulo}}>
            {children}
        </GlobalContext.Provider>
    )
}