// 7 min L13 chaiCode backend

import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// After "http://localhost:8000" we have "/api/v1/user" and then, these:- 
// 17:18 L14; injecting multer middleware:-
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
    );
// router.post("/register", registerUser); // -> Old method

// 52:30 L16 -> Adding logout and login routes
router.route("/login").post(loginUser);

// 26:34 L17) Making endpoint for refreshing the tokens. 27:40 -> It need not be a secured route, so no need of verifyJWT.
router.route("/refreshTokens").post(refreshAccessToken);

// 53:22 L16 -> Now, I have to add such routes which should work if and only if the user is logged in.
// Like here, I need to add logout route. But I know that it should be available, only if the user is logged in. 
// Hence for that purpose, I will use the "verifyJWT" middleware, which checks the accessToken and tells if that matches.
// NOTE: So, let's call these routes as "Secured Routes"
router.route("/logout").post(verifyJWT, logoutUser);
// see 54:15 of L16 to know how to add middlewares in routes.
// 55:29 L16: So, what happened?



export {router};

