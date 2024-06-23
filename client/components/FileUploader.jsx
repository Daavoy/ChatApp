import React, { useRef, useEffect } from 'react';

const FileUploader = ({ currentMessage, handleReset }) => {
    const fileInputRef = useRef(null);

    console.log("File uploader opened")
    const openFileInput = () => {
        console.log('Opening file input'); // Debug log
        if (fileInputRef.current) {
            fileInputRef.current.click(); // Programmatically trigger file input click
        }
    };

    useEffect(() => {
        console.log("curr", currentMessage)
        window.openFileInput = openFileInput
        const handleKeyDown = (event) => {
            console.log(event.key)
            if (event.key === "Enter" && currentMessage === "/addfile") {
                openFileInput();
                handleReset();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [currentMessage]);

    return (
        <div>
            <input
                type="file"
                style={{ display: 'none' }}
                ref={fileInputRef}
            />
        </div>
    );
};

export default FileUploader;
