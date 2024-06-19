
import './App.css'
import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { LoginForm } from '../components/LoginForm'
import Chat from '../components/Chat'
function App() {
  const [time, setTime] = useState('fetching')
  const [submittedUserName, setSubmittedUserName] = useState("");
  const socketRef = useRef(null);

  const handleUserNameSubmit = (userName) => {
    setSubmittedUserName(userName)
    joinRoom(userName)
  }

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');
    const socket = socketRef.current;
    socket.on('connect', () => console.log(socket.id))
    socket.on('connect_error', () => { setTimeout(() => socket.connect(), 3000) })

    socket.on('time', (data) => setTime(data))
    socket.on('disconnect', () => setTime('server disconnected'))
    return () => {
      socket.disconnect();
    };
  }, [])

  const joinRoom = (userName) => {
    console.log(`Submitted username: ${userName}`)
    if (userName === "") {
      return;
    }
    socketRef.current.emit("join_room", userName)
  }

  return (
    <>
      <LoginForm onFormSubmit={handleUserNameSubmit} />
      <Chat socket={socketRef.current} userName={submittedUserName} />
      {time}
    </>
  )
}

export default App
