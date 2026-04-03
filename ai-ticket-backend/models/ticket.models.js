import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    title: String,
    description: String,
    status:{
        type:String,
        default:"TODO"
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    creatorName:{
        type: String,
        required: true,
    },
    creatorEmail:{
        type: String,
        required: true,
    },
    assignedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default: null
    },
    priority: String,
    deadline: Date,
    helpfulNotes: String,
    relatedSkills: [String],
    createdAt:{
        type: Date,
        default: Date.now
    }
}, {timestamps:true})

export default mongoose.model("Ticket", ticketSchema);