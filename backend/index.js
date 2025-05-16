import express from "express";
import cors from "cors";
import db from "./config/database.js";
import UserRoute from "./route/UserRoute.js";
import ContactRoute from "./route/ContactRoute.js";
import ChatRoute from "./route/ChatRoute.js";

// (Opsional) import middleware Auth jika ada
// import verifyToken from "./middleware/AuthMiddleware.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json()); // parse JSON body

// Cek koneksi DB
try {
    await db.authenticate();
    console.log("Database connected...");
    await db.sync(); // akan buat tabel jika belum ada
} catch (error) {
    console.error("Database connection error:", error);
}

// Routing
app.use("/users", UserRoute);
app.use("/contacts", ContactRoute);
app.use("/chats", ChatRoute);

// Default route
app.get("/", (req, res) => {
    res.json({ msg: "Welcome to the Chat App API" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
