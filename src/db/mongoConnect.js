import mongoose from "mongoose";
import {DB_NAME}  from "../constants.js";

const ConnectDatabase = async()=>{
    try {
        const ConnectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}${DB_NAME}`)
        console.log("Database Connected !!!!")
        console.log(`HOST: ${ConnectionInstance.connection.host}`)        
    } catch (error) {
        console.log("Connection Error!!! ERR: ",error);
        process.exit(1)
    }
}

export default ConnectDatabase;