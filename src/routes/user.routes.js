// 7 min L13 chaiCode backend

import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
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

export {router};

