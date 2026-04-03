import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import "dotenv/config";
import { connect_db } from "./db/index.js"
import userRoute from "./routes/user.routes.js"
import ticketRoute from "./routes/ticket.routes.js"
import { serve } from "inngest/express"
import { inngest } from "./inngest/client.js"
import { onUserSignup} from "./inngest/functions/on-signup.js"
import { onTicketCreated } from "./inngest/functions/on-ticket-create.js"


const app = express();

app.use(cors({
  origin: "https://sayanindra83.github.io", 
  credentials: true
}));
app.use(express.json());

// routing

app.use("/api/auth", userRoute)
app.use("/api/tickets", ticketRoute)

app.use("/api/inngest", serve({
    client: inngest,
    functions:[onTicketCreated, onUserSignup],
    
}))
const port = process.env.PORT|| 3000;
connect_db()
.then(()=>{
    app.listen(port);
    console.log(`server is running on port: ${port}`)
    app.on("error", (error) =>{
        console.log("Not able to communicate with database :", error);
        process.exit(1)
    })
}
)
.catch((err)=>{
    console.log("Error while connecting to mongoDB!!", err)
}
)