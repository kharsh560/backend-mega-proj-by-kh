// import the schema which are needed to write controllers in this file.
// NOTE: The schema which you import, have entire database access to themselves.
// Means, if you for wxample write user.create() -> then this user schema directly talks to the database
// and created desired new document in there.
// Or if you use: User.findByIdAndUpdate(userId,{$push:}) -> this will search the 'userId' in the User database
// and will update it with the info given here.

import { User } from "../models/user.model.js";
import uploadOntoCloudinary from "../utils/cloudinaryService.js";
import jwt from "jsonwebtoken";

// 4:23 L14 Chai Aur Backend -> Making the registerUser Controller
// NOTE: registerUser Algo:-
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
    return res.status(400).json({ error: "All fields are required!" });
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

  const avatarLocalPath = req.files?.avatar ? req.files?.avatar[0]?.path : null;
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

// 5:10 min L16 -> Making the loginUser Controller
// NOTE: loginUser Algo:-
// S0) Make the loginUser controller and simultaneously export it.
// S1) Get the user's email/username and password from the request's body. And check them if they are empty!
// S2) Do a find one operation on the backend for the user and if it is available, check the password using "isPasswordCorrect" method from the userSchema.
// S3) After every login, we need to update the access and the refresh token and store the refresh token inside the user in DB.
// S4) Provide the access token to user for authentication and store this in the cookie.

// These Access and Refresh tokens' generation is so commonly used that we should make stand-alone functions for them.
const generateAccessAndRefereshTokens = async (user) => {
  try {
    // What to do here?
    // 1) use the "user" as queried from the backend (DB) to access the custom built functions to generate the access token and refresh token.
    // 2) Save the refresh token to DB also and save the access token to cookie.
    // Here's 1)
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    // Here's 2)
    user.refreshToken = refreshToken;
    // Do Note, I didn't make any extra call for "user" from DB. Else, the already made call & available "user" from DB was passed in this function!
    // Search "S3) 17:22 L16" to go to that part!
    await user.save({ validateBeforeSave: false });
    // This "user" is the user from DB, not the "User" -> Its logical also, bcoz, "User" will give current value. But what we are updating, will be related to "user, from DB"
    // Why we used this "validateBeforeSave"? -> Ans: 22:28 min L16

    // 23:45 -> Now just return these accessToken and refreshToken.
    return { accessToken, refreshToken };
  } catch (error) {
    res.status(500).json({
      error:
        "Something went wrong while generating the refresh token and access tokens.",
    });
  }
};

const loginUser = async (req, res) => {
  // S1) 9:16 min L16
  const { userName, email, password } = req.body;
  // checking:
  if (!userName && !email) {
    // Here '||' was changed to -> '&&' Because as per logic, if BOTHof them are not present then, send that error.
    // And, if even, any one is present, then we will get the user with that one field!
    return res.status(400).json({ error: "Username or email is required!" });
  }
  // S2) 11:35 min L16
  // If we want to implement the logic as like, we gave only ony field of userName/email to the user, then here we need to check if the submitted text is userName or email.
  // But here I think sir is implementing the logic as like, we ask only for all those three fields, userName, email and password. Got it!!
  // 11:45 -> Finding the user with either the userName or the password. he same logic, using "$or":-
  const queriedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });
  // 13:42 Even after using "or" if we don't get the user this means there is no user present!
  if (!queriedUser) {
    return res.status(404).json({ error: "User not found, please sign up!" });
  }
  // 14:15 But if the user is found, then? Then go for next part of 'S2' -> check for the password match.
  const doesPaswordMatch = await queriedUser.isPasswordCorrect(password);
  // NOTE: 15:07 -> The mongoose "User" does not have the methods we made, else, the user which we have queried has those custom methods which we made.
  // Do note that the password here is the one which we are getting from request.
  // Log in the user by following successive steps.
  if (!doesPaswordMatch) {
    return res.status(401).json({ error: "Password incorrect!" });
  }

  // S3) 17:22 L16 -> These tokens' generation is so commonly used that we should make stand-alone functions for them. So, see top of this same file.
  // See the concern I had regarding sir's code from OneNote. We can directly pass the queriedUser object (already fetched in this loginUser function) to the generateAccessAndRefereshTokens function.
  // 24:34 -> Using this function.
  const { accessToken, refreshToken } =
    await generateAccessAndRefereshTokens(queriedUser);

  // This custom function (generateAccessAndRefereshTokens) will save the refresh token in the user's DB.. We just need to save the accesstoken in the cookie!
  // Means jo bhi kaam "MongoDB" ka tha, wo ho gya! Means, queried user ke ander toh nahi, but DB ke iss user mei aa gya h refresh token.

  // S4) 26 min -> Send the access token to cookies.
  // 28:30 : Its a default way to access the cookies! Copy paste it whenever want to use. Will study about it in detail later.
  const options = {
    httpOnly: true,
    secure: true,
  };
  // 29:19 -> Yes we send back the cookies using "res" only!
  // By me: But first, I need to remove the refresh token from the "queriedUser" and also the password.

  // NOTE VVI -> 27:08 L16) Sir is making a new DB call to get the loggedInUser, and "select" is a function of mongoose, not JS's inbuilt!
  // const loggedInUser = queriedUser.select("-password -refreshToken");
  // const loggedInUser = queriedUser.map((eachField) => {
  //   if (eachField === "password" || eachField === "refreshToken") continue;
  // });

  // const loggedInUser = Object.keys(queriedUser).reduce((acc, key) => {
  //   if (key !== "password" && key !== "refreshToken") {
  //     acc[key] = queriedUser[key];
  //   }
  //   return acc;
  // }, {});

  const loggedInUser = {};
  const userObj = queriedUser.toObject(); // Converts to plain JS object

  for (const key in userObj) {
    if (key !== "password" && key !== "refreshToken") {
      loggedInUser[key] = userObj[key];
    }
  }

  // Now we're good to go!
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      user: loggedInUser,
      accessToken: accessToken,
      refreshToken: refreshToken,
      // Not recommended to send the tokens as response, but it might be of use in some cases. So, just testing it!
      message: "User logged in successfully!",
    });
};

// 33:10 -> Making 'logoutUser' functionality.
// NOTE: logoutUser Algo:-
// S0) Make the logoutUser controller and simultaneously export it.
// S1) I guess, deleting the access token for that user would do the job!
// S2) Just I realised, we also need to blanken the refreshToken if the user has logged out by his own free will. And that, he will have to enter credentials next time to login.
// Yeah! Now you are getting the sar of backend, only these two things are needed!
const logoutUser = async (req, res) => {
  // Should there be any data sent from frontend? -> I personaly think, yes! We need the userId or any thing to log out (delete refresh token from) only the particular user!
  // Sir's response on this:- 34:40 (L16)
  // Actual solution by sir:- 35:20 (L16) -> Inject the user info in 'res' and use it here to logout the user!! yeah!
  // So, 37:06 (L16) -> Making our first custom middleware!

  // See 55:29 L16: We made the middleware and even added it before this logout fxn in the routes!
  // So, now, let's use "req.user" to access the entire user.
  // Blankening the "refreshToken" from user in DB.
  // 57 min: Using "findByIdAndUpdate"
  // console.log("User data from request: ", req.user);
  // It was only coming as undefined! -> Now its working.
  // How: Just corrected this in verifyJWT's signature (argument):- "err, req, res, next" -> "req, res, next"

  await User.findByIdAndUpdate(
    req.user._id,
    // {
    //   $set: {
    //     refreshToken: undefined,
    //   },
    // },
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  // For checking purpose:-
  // console.log(
  //   "Access Token before removal from the cookies.",
  //   req.cookies?.accessToken
  // );
  // console.log(
  //   "Refresh Token before removal from the cookies.",
  //   req.cookies?.refreshToken
  // );

  // AccessTokenAfterLogout: req.cookies?.refreshToken,
  // RefreshTokenAfterLogout: req.cookies?.accessToken,
  // I was testing this by sending them as a json rsponse, but its a wrong way of testing whether the tokens are cleared from cookies or not.

  // 58:40 L16: Deleting the "accessToken"
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({
      success: "User logged out successfully!",
    });
};

// 11:31 min L17 Chai aur Backend)  Making controller for refreshing the access token.
const refreshAccessToken = async (req, res) => {
  // By me:
  // In order to search for the refreshToken in DB, we need the userID.
  // And, we can get the userID by decrypting the request token as given by the req.

  // const refreshTokenFromReq = req.body.requestToken; Apart from the request's body, the token can also be available in cookies!!
  const incomingRefreshToken =
    req.cookies?.accessToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    res.status(401).json({ error: "unauthorised request" });
  }

  // Even after using "return" in every possible place, its a best practice to use try-catch block!
  // Using try-catch in your code essentially acts as a safety net for any unexpected or uncaught errors, especially ones not explicitly handled by your return statements.
  try {
    // 14:47 min, L17) Now we need to verify the token!
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    // 16:38 min, L17) After verification, its not necessary that payload mile hee, bcoz it depends on how we have done the setup.
    // Meaning to say that payload is optional.
    // 17:38 min, L17) So, while setting up refresh token we included the user's '_id' only as the payload.

    // By me
    // Now, after getting the user's _id from the incoming refresh token, we will do a DB query and get that user's refresh token and match it with the incoming one.
    const user = User.findById(decodedToken?._id);

    if (!user) {
      res.status(401).json({ error: "Invalid refresh token" });
    }

    // 19:10 L17) Now, if we are here, then its sure that token is valid only. So, now just match the incoming token with the DB called token.
    if (incomingRefreshToken !== user?.refreshToken) {
      return res.status(401).json({ error: "Refresh token is expired." });
    }

    // 20:55 L17) Now, if they match then? Then, simply generate another access token and pass it to cookie. If you want, also refresh the "refreshToken" -> Here we're doing it.

    const { newAccessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user);
    // Do Note that, this function will also simultaneously save the refreshToken in the database. Now, our task is to jest save them in cookie.

    // Cookie ko access karne ke liye "options"
    const options = {
      httpOnly: true,
      secure: true,
    };

    // Finally just save the tokens in the DB!
    return res
      .status(200)
      .cookie("accessToken", newAccessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json({
        code: "200",
        newAccessToken: newAccessToken,
        newRefreshToken: newRefreshToken,
        message: "Both the tokens regenerated successfully!",
      });
  } catch (error) {
    return res.status(401).json({ error: error });
  }
  // 26:34 L17) We have the controller. Now, let's make the endpoint!
};

// 13 min L18) Writing controller to change the user's password.
const changeCurrentPassword = async (req, res) => {
  // 13:05 L18) Here, we don't need to verify if user is logged in or not. The middleware will handle it and we'll include it while making endpoint!
  // By me:
  // S1) First of all, I will make user enter current password. (Frontend)
  // S2) Simultaneously, I will make user enter new password. There can be a confirm password field also, but it should be done in frontend only. (Frontend)
  // S3) Then, at the backend, I will verify the current password. If it matched, then only I will update the password with the new one.
  // Yes, sir is also doing the same thing.
  // Note: here also, we need the user's id. And that, we can get from cookie.
  // (13:57 L18 -> Sir also focused on the above statement) See, if the user is logged in, then only req.user mei hoga user, bcoz, then only cookies mei tokens honge. (Bcoz we saw, at logout, we removed the tokens from the cookies.)

  const { oldPassword, newPassword } = req.body;

  const userIdFromReq = req.user?._id;

  const userFromDB = await User.findById(userIdFromReq);

  // 15 min L18) Now we need to see is password correct? And this can be done from the pre-built function we made in userModel.
  const isOldPasswordCorrect = await userFromDB.isPasswordCorrect(oldPassword);

  if (!isOldPasswordCorrect) {
    return res.status(401).json({
      error: "User not authorised as password did not match!",
    });
  }

  // If execution comes till this line, that means, we now need to update the password.
  // 16:22 L18) See from here for this part -> See, we added a middleware before saving the password that hashes the newPassword.
  userFromDB.password = newPassword;
  await userFromDB.save({ validateBeforeSave: false });

  // 18 min L18) Done! Now what?
  return res.status(200).json({
    message: "Password updated successfully!",
  });
};

// 19:45 L18) Writing a controller to get the current user. Where is it used? Ans: Arrey yaar, ofc in "about section"
// 20:10 min L18) A simpler code than this is not possible only! Why?
// Ans: We made a middleware "verifyJWT" which injects entire "user" (except password and refreshToken, ofcourse) into "req".
const getCurrentUserInfo = async (req, res) => {
  // If user is logged in, then only this line's execution will take place.
  const userFromReq = req.user;
  return res.status(200).json({
    user: userFromReq,
    message: "Current user fetched successfully!",
  });
};

// 21:48 min L18) Controller for user account details updation.
const updateUserAccountDetails = async (req, res) => {
  // Suppose, we want to let user update fullName & email. And not the "userName":-
  const { fullName, email } = req.body;
  // 23:05 L18) We should be creating separate controller for "file updation" and in the frontend also, it should be separate. (as per production level.)
  if (!fullName || !email) {
    // Means we are expecting BOTH, email and password.
    return res.status(400).json({
      error: "Both the fields, email and password are required!",
    });
  }
  // 24:20 L18) Sir writing, the below code which I wrote.
  // Now as we have both, we need to update them.
  // So, again, need to get that user. So, "req" will help. (Which got populated via verifyJWT, ofcourse!)

  const userIdFromReq = req.user?._id;
  // if (!userIdFromReq) No need to check, as these lines will execute only after verifyJWT is doing successful verification.

  // 24:50 L18) Sir is using "findByIdAndUpdate" directly, and not first finding it, then re-writing it and then saving it as I did.
  // const userDataFromDB = await User.findById(userIdFromReq);
  // if (!userDataFromDB) throw new Error("User not found!");

  // userDataFromDB.fullName = fullName;
  // userDataFromDB.email = email;

  // await User.save({validateBeforeSave: false}); -> Its wrong, because 'save()' is a method on a Mongoose document instance, not on the User model.
  // So correct code is:
  // await userDataFromDB.save({ validateBeforeSave: false });

  // 24:50 L18) Sir's code:-
  const updatedUser = await User.findByIdAndUpdate(
    userIdFromReq,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password -refreshToken");
  // This second snippet (sir's method) with findByIdAndUpdate is valid and works. It is a concise and efficient way to update...
  // ...the document directly in the database without fetching it first. It’s commonly used for updates.

  return res.status(200).json({
    message: "User account updated successfully!",
    updatedUserDetails: updatedUser,
  });
};

const updateUserAvatar = async (req, res) => {
  // S1) Get the local file path as uploaded through multer.
  // S2) If path is not present, send error.
  // S3) Now, upload the file to cloudinary and get the URL.
  // S4.1) For the updation, we need the uses's_id, which we will be getting from req.user._id
  // S4.2) Now, finally update the URL in DB.

  // 31:22 L18) Sir's explanation.
  // S1)
  // const avatarLocalPath = req.files?.avatar ? req.files?.avatar[0]?.path : null;
  // 31:50 L18) Above line of code is wrong because, there's only one file to be uploaded by the user. And hence doing this will only serve the purpose.
  const avatarLocalPath = req.file?.path;
  // NOTE: Just in order to recall, I'm noting, we've till now seen four terms inside "req"
  // i. req.body (natural)
  // ii. req.cookies (injected through cookie parser)
  // iii. req.user (injected using custom middleware)
  // iv. req.files (injected using multer)

  // S2)
  if (!avatarLocalPath) {
    return res.status(400).json({ error: "Avatar file is required!" });
  }

  // S3)
  const avatarURL = await uploadOntoCloudinary(avatarLocalPath);
  if (!avatarURL) {
    return res
      .status(400)
      .json({ error: "Error while uploading avatar to cloudinary." });
  }

  // 34:29 L18) Sir is giving time to think about step 4
  // S4.1)
  const userId = req.user?._id;
  // S4.2)
  const updatedAvatarUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        avatar: avatarURL.url,
        // 36:18 L18) Here it should be avatarURL.url and not simply avatarURL
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json({
    message: "Avatar updated successfully!",
    updatedAvatarUser,
  });
};

// 36:53 L18) Writing similar function for coverImage updation
const updateUserCoverImage = async (req, res) => {
  // S1) Get the local file path as uploaded through multer.
  // S2) If path is not present, send error.
  // S3) Now, upload the file to cloudinary and get the URL.
  // S4.1) For the updation, we need the uses's_id, which we will be getting from req.user._id
  // S4.2) Now, finally update the URL in DB.

  // 31:22 L18) Sir's explanation.
  // S1)
  // const coverImageLocalPath = req.files?.coverImage ? req.files?.coverImage[0]?.path : null;
  // 31:50 L18) Above line of code is wrong because, there's only one file to be uploaded by the user. And hence doing this will only serve the purpose.
  const coverImageLocalPath = req.file?.path;
  // NOTE: Just in order to recall, I'm noting, we've till now seen four terms inside "req"
  // i. req.body (natural)
  // ii. req.cookies (injected through cookie parser)
  // iii. req.user (injected using custom middleware)
  // iv. req.files (injected using multer)

  // S2)
  if (!coverImageLocalPath) {
    return res.status(400).json({ error: "Cover image file is required!" });
  }

  // S3)
  const coverImageURL = await uploadOntoCloudinary(coverImageLocalPath);

  if (!coverImageURL) {
    return res
      .status(400)
      .json({ error: "Error while uploading cover image to cloudinary." });
  }

  // 34:29 L18) Sir is giving time to think about step 4
  // S4.1)
  const userId = req.user?._id;
  // S4.2)
  const updatedcoverImageUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        coverImage: coverImageURL.url,
        // 36:18 L18) Here it should be coverImageURL.url and not simply coverImageURL
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json({
    message: "Cover image updated successfully!",
    updatedcoverImageUser,
  });
};

// L20 14:50 min) After getting a look upon of how to build aggregation pipelines, let's start coding of "getUserChannelProfile"

// L20 15:27 min) S1) First of all, we need the info of whice profile to visit. And for this we generally use "params" ...
// ... so, we will be getting the userName using req.params! ...
// ... L20 16:47 min) S2) Now, we have the userName, what should we do next? ...
// ... One way, we can query the "User" with the "userName" and then when we get that document, in the users, then, we can apply aggregation pipelines. ...
// ... But, its not necesary. 17:21 L20) We can directly use aggregation pipelines! Yes, recall, we used to use "$match"! ...
// ... See from 17:40 L20) Sir's writing the aggregate pipelines on "User" model. ...
// ... 19:20 L20 -> after the "$match" stage, we have one document from the User. And its the one whose userName matches with the one we got from params. ...
// ... On the basis of that document, we'll do "$lookup" -> Why? See 19:28 L20. Because, we need to find the subscribers of that user which we just found. ...
// ... 20:14 L20 -> Sir's discussing that naming convention of mongoDB while saving our schemas. See "subscription.model.js" file. You'll get to know. ...
// ... See, we want the channel's subscribers. Means, the user we have selected, suppose it has some '_id', so, we want all such documents present in "subscriptions model" who has "channel" as this user's "_id" ...
// ... Because, all the subscription documents, who will be having "channel" as this user, those will only be this user's or say this channel's subscribers!!!! ...
// ... A doubt, which got cleared by myself. It was like this; the second lookup will for sure search for all the docs in "subscriptions" model to get the desired output and will add it to the result from the first lookup, isn't it? ...
// ... GPT ans: Exactly! The second "$lookup" always works with the entire subscriptions collection, but it only affects the documents already processed by the first "$lookup". ...
// ... 24:35 L20) So, what we did till now? Ans: Sir has done all the basics, applied 4 stages as of now, 1)$match 2)$lookup 3)$lookup 4)$addFields ...
// ... And till this point, in that user document, we have added two fields, "subscribersCount" and the "channelsSubscribedToCount"! ...
// ... Next what? 24:58 L20) projection and the subscribeButtonState (25:10) ...
// ... 25:26 L20) Conding the "subscribeButtonState" -> I had already thought about it. We will have to search ourself in the "subscribers" which we created in previous stages. ...
// ... 28:22 L20) Finally using projection ($project) -> Means, it acts like "select()" -> Yes, here we give the values which we have to project(send/pass further), a flag of 1. ...
// ... 30:25 L20) So, the entire pipeline is done! ...
// ... 30:45 L20) What data type does aggregate return? -> console.log() to let know, or see docs! "We get the array of objects" -> In our case, we have only one doc in final output, so we will get array containing that one doc as object.

const getUserChannelProfile = async (req, res) => {
  // L20 15:27 min) S1
  const { userName } = req.params;

  if (!userName?.trim()) {
    // "trim()" just removes all the leading and trailing blank spaces.
    return res.status(400).json({
      error: "User name is missing.",
    });
  }
};

// 4:17 L21) Writing controller for getting the watch history of the user.
const getWatchHistory = async (req, res) => {
  // const {userName} = req.params; -> No, we can't use this! ...
  // ... Bro, we are going to see the actual user's watch history. Earlier toh, we were going to ...
  // ... a different user's profile, hence we needed to take that from params.
  if (!userName?.trim()) {
    return res.status(400).json({
      error: "Username is missing.",
    });
  }

  const watchHistory = await User.aggregate([]);
};

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUserInfo,
  updateUserAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
