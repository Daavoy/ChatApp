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
    const [availableChannels, setAvailableChannels] = useState([]);
    const [showFileUploader, setShowFileUploader] = useState(false);
    const [currentMessage, setCurrentMessage] = useState("");
    const [command, setCommand] = useState("");
    const [messageList, setMessageList] = useState([]);
    const { userName } = location.state || {}; // Access the state passed from Home


    const createChannel = () => {
        //TODO: Add Channels to database
        try {
            if (!currentMessage.toLocaleLowerCase().includes("/createchannel")) {
                console.log("Invalid command", currentMessage)
                return;
            }
            const currentMessageArguments = currentMessage.split(" ");
            if (currentMessageArguments.length < 2) {
                console.log("Command must contain at least one argument")
                return;
            }
            setAvailableChannels((prev) => [...prev, currentMessageArguments[1]]);

        } catch (error) {
            console.error("Error when creating new channels", error);
        }
    }
    const deleteChannel = () => {
        try {
            const currentMessageArguments = currentMessage.split(" ");
            if (currentMessageArguments[0].toLowerCase() !== "/deletechannel") {
                console.log("Invalid command");
                return;
            }
            if (currentMessageArguments.length < 2) {
                console.log("Must contain at least one argument");
                return;
            }
            if (!availableChannels.includes(currentMessageArguments[1])) {
                console.log("No channels matching the argmuent", currentMessageArguments[1])
                return;
            }
            const updatedChannels = availableChannels.filter((channel) => channel !== currentMessageArguments[1]);
            setAvailableChannels(updatedChannels);
        } catch (error) {
            console.error("Error when deleting channel", error);
        }
    }
    const executeCommands = (command) => {
        if (command.includes("/createchannel")) {
            createChannel();
            return;
        }
        if (command.includes("/deletechannel")) {
            deleteChannel();
            return;
        }
        if (command === "/addfile") {
            console.log("file added")
            setCommand(currentMessage);
            setShowFileUploader(true);
            return;
        }

        console.log("No command");
    }

    const sendMessage = async () => {
        if (currentMessage === "") {
            return;
        }
        const command = currentMessage.toLowerCase();
        if (command[0] === '/') {
            executeCommands(command);
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
            {availableChannels && availableChannels.map((channels, idx) => <p key={idx}>{channels}</p>)}
        </div>
    )
}

export default Chat;