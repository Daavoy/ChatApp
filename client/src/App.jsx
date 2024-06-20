
import './App.css'
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Chat from '../components/Chat'
import Home from '../components/Home';
import { SocketProvider } from '../context/SocketContext';
function App() {


  // <Chat socket={socketRef.current} userName={submittedUserName} />
  // {time}

  return (
    <SocketProvider>

      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>

      </Router>
    </SocketProvider>
  )
}

export default App
