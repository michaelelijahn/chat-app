import { createContext, useState, useEffect, useContext, ReactNode, useRef } from "react";
import { useAuthContext } from "./AuthContext";
import io, { Socket } from "socket.io-client";

interface SocketInterface {
    socket: Socket | null;
    onlineUsers: string[]
}

const SocketContext = createContext<SocketInterface | undefined>(undefined);

export const useSocketContext = ():SocketInterface => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error("useSocketContext must be within a SocketContextProvider");
    }
    return context;
}

const socketURL = import.meta.env.MODE === "development" ? "http://localhost:3002" : "/"

const SocketProvider = ({ children } : { children: ReactNode }) => {
    const socketRef = useRef<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const { user, loading } = useAuthContext(); 

    useEffect(() => {
        if (user && !loading) {
            const socket = io(socketURL, {
                query: {
                    userId: user.id
                }
            });
            socketRef.current = socket;

            socket.on("getOnlineUsers", (users: string[]) => {
                setOnlineUsers(users);
            });

            return () => {
                socket.close();
                socketRef.current = null;
            }
        } else if (!user && !loading) {
            if (socketRef.current) {
                socketRef.current.close();
            }
        }
    }, [user, loading]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, onlineUsers }} >
            {children}
        </SocketContext.Provider>
    )
}

export default SocketProvider;