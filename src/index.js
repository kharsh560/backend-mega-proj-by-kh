// import mongoose from "mongoose";
// import { DB_NAME } from "./constants.js";
// import express from "express";
import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({ path: "./env" }); // "../env } Also works"

connectDB()
.then(() => {
  // Express part:-
  app.on("error", (errorInOnEvent) => {
    console.log("Error: ", errorInOnEvent);
    throw errorInOnEvent;
  });

  app.listen(process.env.PORT, () => {
    console.log(`App/Server is listening on port: ${process.env.PORT}`);
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

