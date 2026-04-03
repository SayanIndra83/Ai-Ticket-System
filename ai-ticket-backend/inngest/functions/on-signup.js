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

      await step.run("send-welcome-email", async()=>{
        const subject = `Welcome to the app`
        const message = `Pranam ${userName} 🙏,
        Thanks for signing up. We're glad to have you onboard!`

        await sendMail(user.email, subject, message)
      })

      return {success: true}
    } catch (error) {
        console.log("❌Error running step", error.message)
    }
  }
)