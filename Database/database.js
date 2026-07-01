import mongoose from "mongoose"
import { startFeedScoreCron } from "../cron/feedScoreJob.js";
import dotenv from "dotenv"
dotenv.config()


const connectionDb = async ()=>{

    try {
        await mongoose.connect(process.env.DATABASE_URL)
        console.log("Database connected")
        startFeedScoreCron(); 
    } catch (error) {
        console.log(error)
    }
}
export default connectionDb;