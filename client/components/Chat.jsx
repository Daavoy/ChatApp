/* eslint-disable react/prop-types */
import React from "react"
import "../styles/Chat.css"
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import FileUploader from "./FileUploader";
import axios from "axios";

const Chat = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const socket = useSocket();
    const [availableChannels, setAvailableChannels] = useState([]);
    const [showFileUploader, setShowFileUploader] = useState(false);
    const [currentMessage, setCurrentMessage] = useState("");
    const [command, setCommand] = useState("");
    const [helpMessage, setHelpMessage] = useState("");
    const [messageList, setMessageList] = useState([]);
    const { username } = location.state || {}; // Access the state passed from Home

    /**
     * Will create a channel with the specified name if the command is valid, and there doesn't already exist a channel with the same name.
     * @returns {void}
     */
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
    const logOut = async () => {
        console.log("logging out");
        try {
            const response = await fetch("http://localhost:5000/api/auth/logout", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include" // Important for including cookies
            });
            if (!response.ok) {
                throw new Error("Not ok");
            }
            const data = await response.jsonc();
            console.log(data);
        } catch (err) {
            console.error(err);
        }
    };

    const displayUsers = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/users", {
                method: "GET",
                credentials: "include",
                headers: { 'Content-Type': 'application/json', "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2OTE3ZmRiMmE5ZjM0NzE0MTEyNWZiNyIsInVzZXJuYW1lIjoidGVzdCIsInJvbGVzIjpbInVzZXIiXSwiaWF0IjoxNzIxMDQ0ODA0LCJleHAiOjE3MjEwNDU3MDR9.6Nmesvcmb1RKstjE2Hux2uMO8V2J_wc50X_BEgV2KdY" }
            })
            if (!response.ok) {
                const refresh = await fetch("http://localhost:5000/api/auth/refresh", {
                    method: "GET",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                })
                console.log(refresh);
                if (refresh.ok) {
                    const refData = await refresh.json();
                    console.log(refData)
                    return;
                }

            }
            const data = await response.json();
            console.log(data);
        } catch (err) {
            console.error(err);
        }
    }


    /**
     * This method fetches all available commands from the backend and renders the results.
     * @returns {void}
     */
    const helpCommand = async () => {
        try {
            const response = await fetch("http://localhost:5000/commands");
            if (!response.ok) {
                //TODO ADD AN ERROR-MESSAGE TO DISPLAY TO USER IN CHAT
                throw new Error("Failed to fetch commands");
            }
            const data = await response.json();
            console.log(data.commands);
            const fetchedCommands = data.commands.map((doc) => {
                return `${doc.commandName} \t ${doc.description}\n`
            });
            setHelpMessage(fetchedCommands);
            // setCurrentMessage(data);
            // await sendMessage();
        } catch (err) {
            console.error("Error executing command", err);
        }
    }
    /**
     * Will delete the channel specified by the currentmessage if the command is legal, and there exists an channel with the specified name.
     * @returns {void}
     */
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
    /**
     * This method executes the input command. If there is no matching command, it does nothing.
     * @param {string} command  
     * @returns {void}
     */
    const executeCommands = async (command) => {
        console.log("command", command);
        if (command === "-h") {
            helpCommand();
            handleReset();
            return;
        }
        if (command.includes("/users")) {
            displayUsers();
            handleReset();
            return;
        }
        if (command.includes("/logout")) {
            logOut();
            handleReset();
            return;
        }

        if (command.includes("/createchannel")) {
            createChannel();
            handleReset();
            return;
        }
        if (command.includes("/deletechannel")) {
            deleteChannel();
            handleReset();
            return;
        }
        if (command === "/addfile") {
            console.log("file added", currentMessage)
            setShowFileUploader(true);
            return;
        }
        console.log("Not a valid command");

    }
    /**
     * Will send a message by using a socket. If the message is a command, it will display the results to the current user only.
     * @returns {void}
     */
    const sendMessage = async () => {
        //TODO: THIS IS A TEMPORARY FIX, FIND OUT A BETTER WAY TO REMOVE THE -h RESULTS
        setHelpMessage("");
        if (currentMessage === "") {
            return;
        }
        const command = currentMessage.toLowerCase();
        if (command[0] === '/' || command[0] === "-") {
            executeCommands(command);
            return;
        }

        const messageData = {
            sender: username,
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
        setCurrentMessage("");
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
                {helpMessage && helpMessage.map((message, idx) => {
                    return <p key={idx}>{message}</p>
                })}
                {showFileUploader && <FileUploader message={currentMessage} handleReset={handleReset} />}


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