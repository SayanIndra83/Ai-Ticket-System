import mongoose from "mongoose";
import dotenv from "dotenv"
import { DB_NAME } from "../constant.js";

const connect_db = async()=>{
    try {
        const conectionInstace = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
         console.log(`\n Congratulations, MongoDB is connected !! DB_HOST: ${conectionInstace.connection.host}`)
    } catch (error) {
        console.log("Failed to connect to Database", error)
        process.exit(1)
    }
}

export {connect_db}