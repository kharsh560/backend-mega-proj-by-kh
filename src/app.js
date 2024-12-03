import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express() 
// the "app" variable now has all the powers of express instance.
// Lec-9 : Chai aur Code
// The cors can further have an object of what all things it should be taking.
app.use(cors()); 

// For data from URL forms/body, when we accept data, we do some restrictions!
app.use(express.json({limit: "16kb"}));

// For data from URL:
app.use(express.urlencoded({extended: true, limit: "16kb"}));

// 17:40 -> For maybe a public folder or public assets
app.use(express.static("public"));

// 18:30 -> To access the user's browser cookies and set them too.
app.use(cookieParser());


// 8:40 L13 -> Routes

// routes importing statements
import {router as userRouter} from "./routes/user.routes.js"

// routes declaration
// app.use("/user", userRouter); // Standard api routing practice:- see below
app.use("/api/v1/user", userRouter);


export default app


