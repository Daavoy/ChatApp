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
        immutable: true,
        default: () => Date.now()
    },
    messages: { type: [mongoose.SchemaTypes.ObjectId], default: [] }
})

const User = mongoose.model("User", UserSchema);
export { User };