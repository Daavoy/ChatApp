
export const createChannel = () => {
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
export const deleteChannel = () => {
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
    {
        console.log("No command");
        return;
    }
}