import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    /*
    NOTE:
    Q) Should I include if condition before chaining connectionInstance? Like this:

    if(!connectionInstance) {
        console.log("error: Error in DB connection.");
        process.exit(1);
    }
    else {
        console.log(`\n MongoDB connected successfylly! DB Host: ${connectionInstance.connection.host}`);
    }
    Ans)
    The check "if (!connectionInstance)" is unlikely to trigger because mongoose.connect() throws an error if it fails, 
    meaning the catch block would already handle the failure.
    In practice, this extra check is unnecessary, as the code will not reach 
    the if condition if the connection fails.
    Both versions effectively accomplish the same thing: exit the process if the database connection fails. 
    The extra check does not improve functionality since mongoose.connect() reliably throws an error if the connection fails.

    So remove it.
    */
    console.log(
      `\n MongoDB connected successfully!! DB Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log(
      "MongoDB connection error: in src->db->index.js->{connectDB function}",
      error
    );
    process.exit(1);
  }
};

export default connectDB;
