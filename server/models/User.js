import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        maxLength: 64,
        unique: true
    }
    , roles: {
        type: [String],
        default: ["user"]
    },
    password: {
        type: String,
        required: true,
        maxLength: 64,
        minLength: 8
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    messages: [mongoose.SchemaTypes.ObjectId]
})

const User = mongoose.model("User", UserSchema);
export { User };