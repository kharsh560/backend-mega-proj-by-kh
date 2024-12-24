// 37 min (L16) Chai aur Code backend
// What we are goanna do here:-
// S1) Get the token from either the cookies (by req.cookies.accessToken) or from the request headers.
// S2) Now, ofcourse throw error if there is no accessToken saying that user is unAutherised.
// S3) Else, if the you got the accessToken, then, decode the information it is containing using the ACCESS_TOKEN_SECRET
// Means, you know that, the token (JWT) is nothing but a piece of information with a lock (Secret), who so ever has the (Secret) can access the token's information!
// S4) From the decodedToken, extract "_id" which is the mongoDB's main '_objectId' for any document (here for Users) and do a DB call to get the user's info and simultaneously remove the password and refreshToken.
// Do note; if the queriedUser is "null" || "undefined" then report error "Invalid Access Token."
// S5) Now, how to add it to "req"? -> Ans: Simply do 'req.user = user'
//  50 min, now what?

import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = async (req, res, next) => {
    try {
      // 37 min;
      // Getting the token from either cookies or from the request's header (if sent through postman or using a mobile app)
      const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");
      // 43:50 min (L16): What if there's no token
      if (!token) {
        return res.status(401).json({ error: "Unauthorized request!" });
      }
      // 44:22: Now, as we have the token, then we need to decode the token in order to get the info present inside it!
      // So, we need to ask JWT for it!
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      // 46:46 min What after verification? -> Just go and search the Backend's USER model and inject the "user" entire info (expect password and refreshToken) to req.
      const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken"
      );

      if (!user) {
        return res.status(401).json({ error: "Invalid access token." });
      }

      // 49:35 min Now, when you've got user, simply inject it into the "req"
      req.user = user;
      console.log(
        "user injected in req after successful JWT validation through verifyJWT middleware!",
        user._id
      );
      next();
    } catch (error) {
        return res.status(401).json({error: "Problem in verifyJWT block of function!"})
    }
    // 51:48 min (L16) Going to the routes file.
}