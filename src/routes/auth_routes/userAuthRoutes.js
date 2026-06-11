import express from "express";
import { createUser, userLogin, userLogout, getLoggedInUser } from "../../controllers/auth/userAuth.js";

const userAuthRouter = express.Router();

userAuthRouter.post("/signup", createUser);

userAuthRouter.post("/login", userLogin);

userAuthRouter.get("/me", getLoggedInUser);

userAuthRouter.post("/logout", userLogout);

export default userAuthRouter;

