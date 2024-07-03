import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema({
    name: String,
    password: String,
    messages: Array
})

module.exports = mongoose.model("User", UserSchema);
