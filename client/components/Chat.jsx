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
        try {
            if (!currentMessage.toLocaleLowerCase().includes("/createchannel")) {
                console.log("Invalid command", currentMessage);
                return;
            }
            const currentMessageArguments = currentMessage.split(" ");
            if (currentMessageArguments.length < 2) {
                console.log("Command must contain at least one argument");
                return;
            }
            const channelName = currentMessageArguments[1];

            // Ensure the socket is connected before emitting the event
            if (socket && socket.connected) {
                socket.emit("create_channel", channelName, (response) => {
                    if (response.success) {
                        setAvailableChannels((prev) => [...prev, channelName]);
                        console.log(`Channel ${channelName} successfully created`);
                    } else {
                        console.error(`Error: ${response.message}`);
                    }
                });
            } else {
                console.error("Socket is not connected");
            }
        } catch (error) {
            console.error("Error when creating new channels", error);
        }
    };

    const helpCommand = async () => {
        console.log("hello from help")
        try {
            const response = await fetch("http://localhost:5000/commands");
            console.log(response)
            if (!response.ok) {
                //TODO ADD AN ERROR-MESSAGE TO DISPLAY TO USER IN CHAT
                throw new Error("Failed to fetch commands");
            }
            const data = await response.json();
            data.commands.map((d) => {
                console.log(d);
            })
            // setCurrentMessage(data);
            // await sendMessage();
        } catch (err) {
            console.error("Error executing command", err);
        }
    }

    const deleteChannel = () => {
        try {
            const currentMessageArguments = currentMessage.split(" ");
            if (currentMessageArguments.length < 2) {
                console.log("Must contain at least one argument");
                return;
            }
            const channelName = currentMessageArguments[1];
            if (currentMessageArguments[0].toLowerCase() !== "/deletechannel") {
                console.log("Invalid command");
                return;
            }


            socket.emit("delete_channel", channelName, (response) => {
                if (response.success) {
                    const updatedChannels = availableChannels.filter((channel) => channel !== channelName);
                    setAvailableChannels(updatedChannels);
                    console.log(`Successfully deleted channel ${channelName}`);
                } else {
                    console.error(`Error deleting channel ${response.message}`);
                }
            });
        } catch (error) {
            console.error("Error when deleting channel", error);
        }
    }
    const executeCommands = async (command) => {
        console.log("command", command);
        if (command === "-h") {
            await helpCommand();
            return;
        }

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
        if (command[0] === '/' || command[0] === "-") {
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