import { LoginForm } from '../components/LoginForm'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'

const Home = () => {
    const location = useLocation()
    const navigate = useNavigate();
    const [connectionMessage, setConnectionMessage] = useState("fetching...");
    const socket = useSocket();
    const { errorMessage } = location.state || {};
    useEffect(() => {
        if (socket && socket.connected) {
            setConnectionMessage("Connected to server.");
        } else {
            setConnectionMessage("Connecting...");
        }
    }, [socket]);


    const handleUserNameSubmit = (userName) => {
        joinRoom(userName)
    }

    const joinRoom = (userName) => {

        if (userName === "") {
            return;
        }
        if (userName !== "" && socket && socket.connected) {
            socket.emit("join_room", userName); // Directly use socket.emit(), no need for socket.current
            navigate("/chat", { state: { userName } });
        }

    }

    return (
        <>
            {errorMessage && <p>{errorMessage}</p>}
            <LoginForm onFormSubmit={handleUserNameSubmit} />
        </>
    )
}


export default Home;