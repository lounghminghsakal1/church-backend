import express from "express";
import { createUser, userLogin, userLogout } from "../../controllers/auth/userAuth.js";

const userAuthRouter = express.Router();

userAuthRouter.post("/signup", createUser);

userAuthRouter.post("/login", userLogin);

userAuthRouter.post("/logout", userLogout);

export default userAuthRouter;

