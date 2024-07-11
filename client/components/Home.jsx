import { LoginForm } from '../components/LoginForm'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'

const Home = () => {
    const location = useLocation();
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


    const handleUserNameSubmit = async (username, password) => {


        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            });

            if (!response.ok) {
                const errormessage = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errormessage.error}`);
            }

            const data = await response.json();
            console.log('Response data:', data);
        } catch (error) {
            console.error('Error during fetch:', error);
        }

        joinRoom(username);
    };

    const joinRoom = (userName) => {

        if (userName === "") {
            return;
        }
        if (userName !== "" && socket && socket.connected) {
            socket.emit("join_room", userName, (response) => {
                if (response.success) {
                    navigate("/chat", { state: { userName } });
                } else {
                    alert(response.message);
                }
            });
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