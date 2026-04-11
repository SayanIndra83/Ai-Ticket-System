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
       const userObj = await User.findOne({email}).lean()

       if(!userObj) throw new NonRetriableError("User is no longer exists in our database.")
        return userObj;
      })

      const frontendUrl = "https://sayanindra83.github.io/Assistant.Ai/"
      await step.run("send-welcome-email", async()=>{
        const subject = `Welcome to the app`
        const message = `Pranam ${userName} 🙏,

Welcome to Assistant.Ai! We are absolutely thrilled to have you onboard.

Your account is all set up and ready to go. You can start creating and managing your tickets right away.

🚀 Access your dashboard here: 
${frontendUrl}

We're here to help if you need anything.

Warm regards,
The Assistant.Ai Team`

        return await sendMail(user.email, subject, message)
      })

      return {success: true}
    } catch (error) {
        console.log("❌Error running step", error.message)
    }
  }
)