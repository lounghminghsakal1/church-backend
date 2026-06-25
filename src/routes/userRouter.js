import express from "express";
import { authUserMiddleWare } from "../middlewares/authMiddlewares.js";
import { getUser, updateUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/", authUserMiddleWare, getUser);

userRouter.patch("/:user_id", authUserMiddleWare, updateUser);


export default userRouter;