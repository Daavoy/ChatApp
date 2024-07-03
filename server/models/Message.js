import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    data: String,
    sentAt: {
        type: Date,
        default: () => new Date().getHours + new Date().getMinutes()
    },
    sentBy: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true,
    },
    sentTo: {
        type: mongoose.SchemaTypes.ObjestId,
        ref: "User"
    }
})

const Message = mongoose.model("Message", messageSchema);

export { Message };