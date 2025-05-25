import express from "express";
import {
  getChatsBetweenUsers,
  sendMessage,
  updateChat,
  deleteChat,
} from "../controllers/chatcontroller.js";
import { verifyToken } from "../middleware/verifytoken.js";


const router = express.Router();

// GET semua chat antara dua user
router.get("/:user1/:user2", verifyToken, getChatsBetweenUsers);

// Kirim pesan
router.post("/send-message", verifyToken, sendMessage);

// Update pesan
router.put("/:id", verifyToken, updateChat);

// Hapus pesan
router.delete("/:id", verifyToken, deleteChat);

export default router;
