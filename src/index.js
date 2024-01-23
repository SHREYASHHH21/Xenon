import "dotenv/config";

import ConnectDatabase from "./db/mongoConnect.js";
import { app } from "./app.js";

ConnectDatabase()
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server started at port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log(`Mongodb connection error ${err}`)
})











// import  express  from "express";
// const app = express();

// (async ()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

//         console.log("Database Connected!!!")

//         app.on("error",()=>{
//             console.log("ERR: ",error);
//             throw err
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log(`App started at port ${process.env.PORT}`)
//         })

//     } catch (error) {
//         console.error("ERROR: ",error)
//         throw err
//     }
// })()
