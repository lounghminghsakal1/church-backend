import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import priestAvailabilityRouter from "./routes/priestAvailabilityRoutes.js";
import priestRouter from "./routes/priestRoutes.js";
import priestAuthRouter from "./routes/auth_routes/priestAuthRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userAuthRouter from "./routes/auth_routes/userAuthRoutes.js";
import baptismRequestRouter from "./routes/baptismRequestRoutes.js";
import path from "path";
import uploadFamilyCardRouter from "./routes/uploadFamilyCardRoutes.js";
import eucharistRouter from "./routes/eucharistRoutes.js";
import confessionRouter from "./routes/confessionRequestRoutes.js";
import meetingRequestRouter from "./routes/meetingRequestRoutes.js";
import confirmationRequestRouter from "./routes/confirmationRequestRoutes.js";
import massPrayerRouter from "./routes/massPrayerRoutes.js";
import marriageRequestRouter from "./routes/marriageRequestRoutes.js";
import anoinTingOfTheSickRouter from "./routes/anointingOfTheSickRequestRoutes.js";

const app = express();
dotenv.config();

app.use(cors({
  origin: "https://church-frontend-ten-lac.vercel.app",
  credentials: true
}))

app.use(cookieParser());
app.use(express.json());

await connectDB();

app.use("/api/auth/priest", priestAuthRouter);

app.use("/api/priest", priestRouter);
app.use("/api/priest_availability", priestAvailabilityRouter);

app.use("/api/auth/user", userAuthRouter);

app.use("/api/user/baptism_request", baptismRequestRouter);

app.use("/api/uploads", express.static(path.join(process.cwd(), "/uploads")));

app.use("/api/uploads/family_card" , uploadFamilyCardRouter);

app.use("/api/user/eucharist_request", eucharistRouter);

app.use("/api/user/confession_request", confessionRouter);

app.use("/api/user/meeting_request", meetingRequestRouter);

app.use("/api/user/confirmation_request", confirmationRequestRouter);

app.use("/api/user/marriage_request", marriageRequestRouter);

app.use("/api/user/mass_prayer", massPrayerRouter);

app.use("/api/user/aos_request", anoinTingOfTheSickRouter);

const port = process.env.PORT;

app.listen(port, () => {
  console.log("Server running... on port "+port);
});
