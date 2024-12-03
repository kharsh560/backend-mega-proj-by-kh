// 7 min L13 chaiCode backend

import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

// After "http://localhost:8000" we have "/api/v1/user" and then, these:- 
router.route("/register").post(registerUser);
// router.post("/register", registerUser); // -> Old method

export {router};

