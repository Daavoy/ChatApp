import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema({
    name: String,
    password: String,
    messages: Array
})

const User = mongoose.model("User", UserSchema);
export { UserSchema, User };