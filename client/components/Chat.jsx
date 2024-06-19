/* eslint-disable react/prop-types */
import React from "react"
import { useState, useEffect } from "react";
function Chat({ socket, userName, room }) {
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState([]);


    const sendMessage = async () => {
        if (currentMessage === "") {
            return;
        }

        console.log(userName)
        const messageData = {
            sender: userName,
            message: currentMessage,
            time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
        }
        setMessageList((prevList) => [...prevList, messageData]);
        await socket.emit("send_message", messageData);
    }
    useEffect(() => {
        if (socket) {
            socket.on("receive_message", (data) => {
                setMessageList((prevList) => [...prevList, data]);
            })
        }
    }, [socket]);
    const handleChange = (e) => {
        setCurrentMessage(e.target.value);
    }

    return (
        <div>
            <div className="chat-header">

            </div>
            <div className="chat-body">
                {messageList.map((message, idx) => {
                    return (
                        <div key={idx} className="message">
                            <p><strong>{message.sender}:</strong> {message.message} <span>{message.time}</span></p>
                        </div>
                    );
                })}
            </div>
            <div className="chat-footer">
                <input type="text" onChange={handleChange} onKeyDown={(event) => event.key === "Enter" && sendMessage()} />
                <button onClick={sendMessage}>&#9658;</button>
            </div>
        </div>
    )
}

export default Chat;