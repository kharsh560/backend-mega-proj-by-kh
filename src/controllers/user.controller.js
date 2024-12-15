// import the schema which are needed to write controllers in this file.
// NOTE: The schema which you import, have entire database access to themselves.
// Means, if you for wxample write user.create() -> then this user schema directly talks to the database
// and created desired new document in there.
// Or if you use: User.findByIdAndUpdate(userId,{$push:}) -> this will search the 'userId' in the User database
// and will update it with the info given here.

import { User } from "../models/user.model.js";
import uploadOntoCloudinary from "../utils/cloudinaryService.js";

// 4:23 L14 Chai Aur Backend
// NOTE: Algo:-
// S1) Extract the needfule info from the response.
// S2) Do validation checks (For now, isEmpty checks)
// S3) Check if the user is already available or not!
// S4) The files are available from multer or not. (avatar should be checked and coverImage is not required.)
// S5) Uploading of the files to cloudinary and getting URL of the uploaded files from there.
// S6) Double check the avatarURL you are getting from cloudinary. As its a required field.
// * means, we first checked ki file aaya ki nahi server par from multer, and then after the file upload
// on cloudinary, we are again checking ki upload hua ki nahi. *
// S7) Now, create the new user document. (using SchemaName.create())
// S8) Check response and Return selective response back to the user, means not entire response. Means, after removing password and refresh token

const registerUser = async (req, res) => {
  // S1)
  const { userName, email, fullName, password } = req.body;
  // avatar and coverImage has to come from cloudinary after successful upload. Frontend se toh proper file aayega!

  // Testing purpose:-
  // console.log("Entire request: ", req);
  // console.log("req.body: ", req.body);

  // S2)
  // 22:40 L14: Pro way to check if any one of the fields is empty or not.
  if (
    [userName, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    res.status(400).json({ error: "All fields are required!" });
  }

  // S3)
  // 25:42 L14: Checking if user already exists.
  // User.findOne({ email });
  // User.findOne({ userName });
  // 27:37 L14 -> About OR ($or) operator in findOne;
  const existingUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existingUser) {
    return res
      .status(409)
      .json({ error: "User with email or username already exists." });
  }

  // S4) 30:08 L14

  // Testing purpose:
//   console.log("req.files:", req.files);
//   console.log("req.files?.coverImage: ", req.files?.coverImage);

  const avatarLocalPath = req.files?.avatar 
    ? req.files?.avatar[0]?.path 
    : null;
  const coverImageLocalPath = req.files?.coverImage
    ? req.files?.coverImage[0]?.path
    : null;

  if (!avatarLocalPath) {
    return res.status(400).json({ error: "Avatar file is required!" });
  }

  // S5) 34:42 L14
  // 37:10 L14 -> We use await to intentionally wait for that process to complete and then only we move forward.
  const avatarURL = await uploadOntoCloudinary(avatarLocalPath);
  const coverImageURL = await uploadOntoCloudinary(coverImageLocalPath);

  // S6) 38:09 L14
  if (!avatarURL) {
    return res.status(400).json({ error: "Avatar file is required!" });
  }

  // S7) 38:41 L14
  const documentedUser = await User.create({
    fullName,
    avatar: avatarURL.url,
    coverImage: coverImageURL ? coverImageURL.url : "",
    email,
    password,
    userName: userName.toLowerCase(),
  });

  // S8) 43:36 L14
  const createdUserFromMongo = await User.findById(documentedUser._id).select(
    "-password -refreshToken"
  );

  if (!createdUserFromMongo) {
    return res.status(500).json({
      error:
        "Something went wrong while registering the user even after documenting the user!",
    });
  } else {
    console.log(createdUserFromMongo);
    res.status(201).json({
      message: "User created successfully!",
      user: createdUserFromMongo,
    });
  }
};

/*
res.status(200).json({
    message: "Worked!",
  });
  // try {
  // } catch (error) {
  //     console.log("Error occured while registering the user.", error);
  // }
*/

export { registerUser };
// not "export registerUser"
