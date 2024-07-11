import { LoginForm } from '../components/LoginForm'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'

const Home = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [connectionMessage, setConnectionMessage] = useState("fetching...");
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [showInitialInput, setShowInitialInput] = useState(true);
    const [command, setCommand] = useState('');
    const socket = useSocket();
    const { errorMessage } = location.state || {};


    useEffect(() => {
        if (socket && socket.connected) {
            setConnectionMessage("Connected to server.");
        } else {
            setConnectionMessage("Connecting...");
        }
    }, [socket]);



    const handleRegister = async (username, password) => {


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
        navigate("/chat", { state: { username } });
    };
    const handleLogin = async (username, password) => {


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
        navigate("/chat", { state: { username } });
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
    const handleChange = (e) => {
        setCommand(e.target.value);
    }
    if (command.toLowerCase() === "/login") {
        setShowLogin(true);
        setShowInitialInput(false);
        setCommand("");
    }
    if (command.toLowerCase() === "/register") {
        setShowRegister(true);
        setShowInitialInput(false);
        setCommand("");
    }

    return (
        <>
            {errorMessage && <p>{errorMessage}</p>}
            {showInitialInput && <div>
                <label htmlFor='initialinput'>/login /register</label>
                <input type="text" id="initialInput" onChange={handleChange}></input>
            </div>}
            {showLogin && <LoginForm onFormSubmit={handleLogin} />}
            {showRegister && <LoginForm onFormSubmit={handleRegister} />}
        </>
    )
}


export default Home;