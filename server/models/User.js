import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        maxLength: 64
    }
    ,
    password: {
        type: String,
        required: true,
        maxLength: 64,
        minLength: 8
    },
    messages: [mongoose.SchemaTypes.ObjectId]
})

const User = mongoose.model("User", UserSchema);
export { User };