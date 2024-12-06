import {createContext, useEffect, useState} from "react";

export const GlobalContext = createContext(undefined);
export const GlobalProvider = ({children}) => {
    const [CurrentUser, setCurrentUser] = useState(() => {
        return JSON.parse(localStorage.getItem('user')) || {};
    });

    useEffect(() => {
        console.log('Current user:', CurrentUser);
        localStorage.setItem('user', JSON.stringify(CurrentUser));
    }, [CurrentUser]);

    return (
        <GlobalContext.Provider value={{CurrentUser}}>
            {children}
        </GlobalContext.Provider>
    )
}