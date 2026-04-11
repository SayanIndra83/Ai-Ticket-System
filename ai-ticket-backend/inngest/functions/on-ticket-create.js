import { inngest } from "../client.js";
import User from "../../models/user.models.js"
import Ticket from "../../models/ticket.models.js"
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";
import analyzeTicket from "../../utils/ai.js";

export const onTicketCreated = inngest.createFunction(
    {id: "on-ticket-created", retries:2, triggers:{event : "ticket/created"}},
    async ({event, step}) =>{
        try {
            const {ticketId} = event.data;

            // fetch ticket from DB
            const ticket = await step.run("fetch-ticket", async() => {
                const ticketObj = await Ticket.findById(ticketId)
            if(!ticketObj) throw new NonRetriableError("Ticket not found")
            return ticketObj
            })

            console.log("Ticket successfully fetched")

            // make the status of the ticket to "TODO"
            await step.run("update-ticket-status", async()=>{
                await Ticket.findByIdAndUpdate(ticket._id, {status: "TODO"})
            })

            console.log("Ticket status set to TODO and sending it to Gemini")


            // fill the ticket details with AI and return the skills
            // pass it to the AI
            const aiResponse = await analyzeTicket(ticket)
            const relatedSkills = await step.run("ai-processing", async() =>{
                
                let skills = []
                if(aiResponse){
                    const safePriority = aiResponse.priority?.toLowerCase() || "medium";
                    await Ticket.findByIdAndUpdate(ticket._id, {
                        priority: !["low", "medium", "high"].includes(safePriority)? "medium" : aiResponse.priority.toLowerCase(),
                        helpfulNotes: aiResponse.helpfulNotes,
                        status: "UNDER_MODERATION",
                        relatedSkills:aiResponse.relatedSkills || []
                    })

                    skills = aiResponse.relatedSkills
                }

                return  skills
            })

            console.log("Got ai response and setting moderator")

            // match the skills with the moderators and assign a moderator, if nobody found then assign to the admin

            const moderator = await step.run("assign-moderator", 
                async()=> {
                    let user = null
                    if(relatedSkills && relatedSkills.length>0){
                    user = await User.findOne({
                        role: "moderator",
                        skills:{
                            $elemMatch:{
                                $regex: relatedSkills.join("|"),
                                $options: "i"
                            }
                        }
                    });
                }
                    
                    if(!user){
                        user = await User.findOne({
                            role:"admin",
                        })
                    }

                    await Ticket.findByIdAndUpdate(ticket._id, {
                        assignedTo: user._id || null
                    })

                    return user;
                });
                
                console.log("Helper added successfully and mail sending initiated")
                // mail sending to the moderator
                await step.run("send-email-notification", async() => {
                    const finalTicket = await Ticket.findById(ticket._id)
                    if(moderator && moderator.email){
                        try {
            return await sendMail(
                moderator.email,
                "New Ticket Assigned",
                `Pranam ${moderator.userName} 🙏!
You have been assigned a new support ticket: "${finalTicket.title}".

🎫 TICKET DETAILS
-------------------------
Priority: ${finalTicket.priority ? finalTicket.priority.toUpperCase() : "N/A"}
Created By: ${finalTicket.creatorName}
Contact: ${finalTicket.creatorEmail}
User ID: ${finalTicket.createdBy}

🤖 AI TRIAGE NOTES
-------------------------
${finalTicket.helpfulNotes || "No AI notes available."}

Please log in to the moderator dashboard to review and resolve this issue.
`
            );
            console.log("📧 Email sent successfully to:", moderator.email);
        } catch (mailError) {
            console.error("⚠️ Mail failed to send, but ticket assignment is complete:", mailError.message);
        }
                    }
                })

                return {success: true};
        } catch (error) {
            console.log("❌, Error while running the step", error.message)
        }
    }

)