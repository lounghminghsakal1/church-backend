import express from "express";
import { authPriest, getLoggedInPriest, logoutPriest } from "../../controllers/auth/priestAuth.js";

const priestAuthRouter = express.Router();

priestAuthRouter.post("/", authPriest);

priestAuthRouter.get("/me", getLoggedInPriest);

priestAuthRouter.post("/logout", logoutPriest);

export default priestAuthRouter;