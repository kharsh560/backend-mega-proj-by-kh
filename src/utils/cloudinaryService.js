import {v2 as v2Cloudinary} from "cloudinary"
import fs from "fs"
// import {fs as fileSystem} from "fs" // (Wasn't getting suggestion doing this.)

// Configuration
v2Cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, 
});

// 18:56 L11 Chai Code Baackend
const uploadOntoCloudinary = async (localFilePath) => {
    try {
      if (!localFilePath) {
        console.log("File path is not provided!");
        return null;
      }
      const response = await v2Cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto",
      });
      // If the file has been uploaded successfully, then:-
      // console.log("File has been uploaded successfully to cloudinary. Here's the url: ", response.url);
      // 14:22 L15 -> Now, we should add the feature of removing the files on succesful upload also!
      fs.unlinkSync(localFilePath);
      // Testing purpose:- 
      // console.log("Cloudinary's entire response: ", response);
      return response;
      // 36:04 L14) We will handle the case of deleting the file after, also successfully uploading it. {done: 14:22 L15}
    } catch (error) {
        // If we get error, then we are goanna "unlink the temporarily stored file."
        fs.unlinkSync(localFilePath);
        // NOTE: We used 'synchronous' method because it will ensure to do the job and then only move ahead, unlike in asynchronous methods.
    }
}

export default uploadOntoCloudinary;

