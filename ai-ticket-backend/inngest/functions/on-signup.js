import { inngest } from "../client.js";
import User from "../../models/user.models.js"
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";


export const onUserSignup = inngest.createFunction(
    { id: "on-user-signup", retries:2, triggers: { event: "user/signup" } },
  async ({ event, step }) => {
    try {
      const {email, userName} =  event.data
      const user = await step.run("get-user-email", async() => {
       const userObj = await User.findOne({email})

       if(!userObj) throw new NonRetriableError("User is no longer exists in our database.")
        return userObj;
      })

      const frontendUrl = "https://sayanindra83.github.io/Ai-Ticket-System/"
      await step.run("send-welcome-email", async()=>{
        const subject = `Welcome to the app`
        const message = `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
  <h2 style="color: #1e293b; margin-top: 0;">Pranam ${userName} 🙏,</h2>
  
  <p style="color: #475569; font-size: 16px; line-height: 1.6;">
    Welcome to <strong>Assistant.Ai</strong>! We are absolutely thrilled to have you onboard.
  </p>
  
  <p style="color: #475569; font-size: 16px; line-height: 1.6;">
    Your account is successfully set up. You can now jump right in, create tickets, and let our AI handle the heavy lifting of categorizing them for you.
  </p>
  
  <div style="text-align: center; margin: 35px 0;">
    <a href="${frontendUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s;">
      Go to Your Dashboard
    </a>
  </div>
  
  <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin-top: 30px;">
    If the button doesn't work, you can copy and paste this link into your browser:<br>
    <a href="${frontendUrl}" style="color: #4f46e5; word-break: break-all;">${frontendUrl}</a>
  </p>
  
  <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
  
  <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-bottom: 0;">
    We're here to help if you need anything.<br>
    Warm regards,<br>
    <strong>The Assistant.Ai Team</strong>
  </p>
</div>`

        await sendMail(user.email, subject, message)
      })

      return {success: true}
    } catch (error) {
        console.log("❌Error running step", error.message)
    }
  }
)