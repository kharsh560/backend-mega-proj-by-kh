// import mongoose from "mongoose";
// import { DB_NAME } from "./constants.js";
// import express from "express";
import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";

// Trying to test if require also works. As per sir, it should.
// require("dotenv").config({ path: "./env" });
// Ofcourse it didn't work!
dotenv.config({ path: "./env" }); // "../env } Also works"
// In package.json, add these too in the "scripts" section to be able to use dotenv:
// "-r dotenv/config --experimental-json-modules"

// Note: 2:55 min L9) The connectDB() is an asynchronous method. Means it returns promise, which needs to be resolved. Hence we're using ".then & .catch"
const port = process.env.PORT || 4800;
// Earlier this "process.env.PORT || 4800" was directly written in app.listen's first parameter and in console log, only process.env.PORT was written by sir. No issues, after learning from him, I fixed it!
// GPT: The updated version of your code, where you store the port in... 
// ...a variable (const port = process.env.PORT || 8000), is indeed better practice for several reasons!
// In the earlier version, process.env.PORT is always logged, even if the default 4800 is used because process.env.PORT is undefined. 
// This could lead to incorrect or misleading log messages.
connectDB()
.then(() => {
  // Express part:-
  app.on("error", (errorInOnEvent) => {
    console.log("Error: ", errorInOnEvent);
    throw errorInOnEvent;
  });

  app.listen(port, () => {
    console.log(`App/Server is listening on port: ${port}`);
  });
})
.catch((err) => {
    console.log("Mongo DB connection error!! ", err);
})

// NOTE: Below is the older code for MongoDb connection.
// const app = express();

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`); // "mongodb://" -> Removed this. Was given as a suggestion by terminal.
//     console.log("Database connected successfully!");
 
    // Express part:-
    // app.on("error", (errorInOnEvent) => {
    //   console.log("Error: ", errorInOnEvent);
    //   throw errorInOnEvent;
    // });

//     app.listen(process.env.PORT, () => {
//       console.log(`App is listening on port: ${process.env.PORT}`);
//     });

//   } catch (error) {
//     console.log(`Error encountered: ${error}`);
//     throw error;
//   }
// })(); // Yes, its the basic syntax of IIFE

