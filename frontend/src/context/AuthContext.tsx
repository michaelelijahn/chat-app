import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react";

type User = {
    id: string,
    fullName: string,
    email: string, 
    // profilePic: string,
}

const AuthContext = createContext<{
    user: User | null;
    setUser: Dispatch<SetStateAction<User | null>>;
    loading: boolean;
    accessToken: string | null;
    setAccessToken: Dispatch<SetStateAction<string | null>>
}>({
    user: null,
    setUser: () => {},
    loading: true,
    accessToken: null,
    setAccessToken: () => {},
});

export const useAuthContext = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({children}: {children:ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    return (
        <AuthContext.Provider value={{user, setUser, loading, accessToken, setAccessToken }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext