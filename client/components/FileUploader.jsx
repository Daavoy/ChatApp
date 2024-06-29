import React, { useRef, useEffect } from 'react';

const FileUploader = ({ message, handleReset }) => {
    const fileInputRef = useRef(null);

    console.log("File uploader opened")
    const openFileInput = () => {
        console.log('Opening file input');
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    useEffect(() => {
        console.log("curr", message)
        window.openFileInput = openFileInput
        const handleKeyDown = (event) => {
            console.log(event.key)
            if (event.key === "Enter" && message === "/addfile") {
                openFileInput();
                handleReset();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [message]);

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
