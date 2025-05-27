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
// --- KONFIGURASI CORS YANG BENAR ---
const allowedOrigins = ['https://projek-akhir-072-096-dot-f-07-450706.uc.r.appspot.com'];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // <-- WAJIB: Izinkan cookies/credentials
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // <-- WAJIB: Izinkan metode
    allowedHeaders: 'Content-Type,Authorization', // <-- WAJIB: Izinkan header
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions)); // Terapkan konfigurasi lengkap
// --- AKHIR KONFIGURASI CORS ---

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

   app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection error:", error);
  }
};

startServer();
