import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    surname: {type: String, required: true},
    email: {type: String, unique: true, required: true},
    age: {type: Number, required: true},
    password: {type: String, required: true},
    role: String
    })

mongoose.set('strictQuery', false)
const userModel = mongoose.model('users', userSchema)

export default userModel