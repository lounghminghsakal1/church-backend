import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import priestAvailabilityRouter from "./routes/priestAvailabilityRoutes.js";
import priestRouter from "./routes/priestRoutes.js";
import priestAuthRouter from "./routes/auth_routes/priestAuthRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
dotenv.config();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}))

app.use(cookieParser());
app.use(express.json());

await connectDB();

app.use("/api/auth/priest", priestAuthRouter);

app.use("/api/priest", priestRouter);
app.use("/api/priest_availability", priestAvailabilityRouter);



const port = process.env.PORT;

app.listen(port, () => {
  console.log("Server running... on port "+port);
});
