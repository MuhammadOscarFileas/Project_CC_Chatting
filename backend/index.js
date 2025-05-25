import express from "express";
import cors from "cors";
import db from "./config/database.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
// Import routes
import UserRoute from "./route/UserRoute.js";
import ContactRoute from "./route/ContactRoute.js";
import ChatRoute from "./route/ChatRoute.js";

// Import semua relasi antar model
import "./models/association.js";

const app = express();
app.set("view engine", "ejs");

dotenv.config();
const PORT = process.env.PORT || 5000;
app.use(cookieParser());

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Routing
app.use("/users", UserRoute);
app.use("/contacts", ContactRoute);
app.use("/chats", ChatRoute);

// Default route
app.get("/", (req, res) => {
  res.json({ msg: "Welcome to the Chat App API" });
});

// Jalankan server setelah koneksi DB berhasil
const startServer = async () => {
  try {
    await db.authenticate();
    console.log("✅ Database connected...");

    await db.sync(); // Sinkronisasi model
    console.log("✅ Database synced...");

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection error:", error);
  }
};

startServer();
