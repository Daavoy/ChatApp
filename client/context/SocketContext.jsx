import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Create a context object
const SocketContext = createContext();

// Custom hook to use the socket context
export const useSocket = () => useContext(SocketContext);

// SocketProvider component
export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Create socket connection when component mounts
        const socketInstance = io('http://localhost:5000');
        setSocket(socketInstance);

        // Clean up socket connection when component unmounts
        return () => {
            socketInstance.disconnect();
        };
    }, []);

    // Provide the socket instance to the context
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
