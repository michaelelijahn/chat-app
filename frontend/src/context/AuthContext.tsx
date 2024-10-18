import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react"
import toast from "react-hot-toast";

type User = {
    id: string,
    fullName: string,
    email: string, 
    profilePic: string,
    gender: string,
}

const AuthContext = createContext<{
    user: User | null;
    setUser: Dispatch<SetStateAction<User | null>>;
    loading: boolean;
}>({
    user: null,
    setUser: () => {},
    loading: true,
});

export const useAuthContext = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({children}: {children:ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const response = await fetch("/api/auth/user");
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error);
                }
                setUser(data);
            } catch (error: any) {
                console.log(error);
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        }
        checkUser();
    }, [])

    return (
        <AuthContext.Provider value={{user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext