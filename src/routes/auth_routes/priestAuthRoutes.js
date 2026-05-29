import express from "express";
import { authPriest } from "../../controllers/auth/priestAuth.js";

const priestAuthRouter = express.Router();

priestAuthRouter.post("/", authPriest);

export default priestAuthRouter;