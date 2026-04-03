import { inngest } from "../inngest/client.js"
import Ticket from "../models/ticket.models.js"


export const createTicket = async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) return res.status(400).json({ message: "Title and description is required." })

        const newTicket = await Ticket.create({
            title, description,
            createdBy: req.user._id,
            creatorName:  req.user.userName,
            creatorEmail:req.user.email
        })

        console.log("Ticket created in Database and sending it to inngest")

        try {
            await inngest.send({
                name: "ticket/created",
                data: {
                    ticketId: newTicket._id.toString(),
                    title,
                    description,
                    createdBy: req.user._id,
                    creatorName: req.user.userName,
                    creatorEmail:req.user.email
                }
            });

            console.log("ticket created successfully")
        } catch (inngestError) {
            console.error("⚠️ Inngest event failed, but ticket was created:", inngestError.message);
        }

        return res.status(201).json({
            success: true,
            message: "Ticket created and processing started",
            ticket: newTicket
        })
    } catch (error) {
        console.error("Error while creating Ticket", error.message)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getTickets = async (req, res) => {
    try {
        const user = req.user
        let tickets = []
        if (user.role !== "user") {
            tickets = await Ticket.find({}).populate("assignedTo", ["email", "_id", "userName"]).sort({ createdAt: -1 })
        }
        else {
            tickets = await Ticket.find({ createdBy: user._id }).select("title description status assignedTo createdAt priority relatedSkills helpfulNotes").sort({ createdAt: -1 })
        }


        return res.status(200).json(tickets)
    } catch (error) {
        console.error("Error while fetching Tickets", error.message)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getTicket = async (req, res) => {
    try {
        const user = req.user;
        let ticket;
        if (user.role !== "user") {
            ticket = await Ticket.findById(req.params.id).populate("assignedTo", ["email", "_id", "userName"])
        }
        else {
            ticket = await Ticket.findOne({
                createdBy: user._id,
                _id: req.params.id
            }).select("title description creatorName creatorEmail status createdAt priority")
            .populate("assignedTo", ["email", "_id", "userName"])
        }


        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found"
            })
        }
        return res.status(200).json(ticket);
    } catch (error) {
        console.error("Error while fetching ticket", error.message)
        return res.status(500).json({ message: "Internal server error" })
    }
}