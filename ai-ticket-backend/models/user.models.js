import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        required:true,
    },
    email:{
        required: true,
        type: String,
        unique:true,
    },
    password:{
        required: true,
        type: String,
    },
    role:{
        type: String,
        default:"user",
        enum:["admin", "user", "moderator"]
    },
    skills:{
        type: [String],
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
}, {timestamps:true})

export default mongoose.model("User", userSchema);