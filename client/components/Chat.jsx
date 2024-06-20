/* eslint-disable react/prop-types */
import React from "react"
import "../styles/Chat.css"
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import FileUploader from "./FileUploader";
const Chat = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const socket = useSocket();
    const [showFileUploader, setShowFileUploader] = useState(false);
    const [currentMessage, setCurrentMessage] = useState("");
    const [command, setCommand] = useState("");
    const [messageList, setMessageList] = useState([]);
    const { userName } = location.state || {}; // Access the state passed from Home


    const sendMessage = async () => {
        if (currentMessage === "") {
            return;
        }
        if (currentMessage === "/addfile") {
            console.log("hello")
            setCommand(currentMessage);
            setShowFileUploader(true);
        }

        const messageData = {
            sender: userName,
            message: currentMessage,
            time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
        }
        setMessageList((prevList) => [...prevList, messageData]);
        setCurrentMessage("");
        await socket.emit("send_message", messageData);
    }
    useEffect(() => {
        if (socket) {
            socket.on("receive_message", (data) => {
                setMessageList((prevList) => [...prevList, data]);
            })
            socket.on('disconnect', () => {
                navigate("/", { state: { errorMessage: "User disconnected from server" } });
            })
        }
    }, [socket]);
    const handleChange = (e) => {
        setCurrentMessage(e.target.value);
    }
    const handleReset = () => {
        setCommand("");
        setShowFileUploader(false);
    }
    return (
        <div>
            <div className="chat-header">

            </div>
            <div className="chat-body hide-scrollbar">
                {messageList.map((message, idx) => {
                    return (
                        <div key={idx} className="message">
                            <p><strong>{message.sender}:</strong> {message.message} <span>{message.time}</span> </p>
                        </div>
                    );
                })}
                {showFileUploader && <FileUploader currentMessage={command} handleReset={handleReset} />}
            </div>
            <div className="chat-footer">
                <input type="text" onChange={handleChange} onKeyDown={(event) => event.key === "Enter" && sendMessage()} value={currentMessage} />
                <button onClick={sendMessage}>&#9658;</button>
            </div>
        </div>
    )
}

export default Chat;