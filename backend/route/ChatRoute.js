import express from "express";
import {
  getChatsBetweenUsers,
  sendMessage,
  updateChat,
  deleteChat,
} from "../controllers/chatcontroller.js";

const router = express.Router();

// GET semua chat antara dua user
router.get("/:user1Id/:user2Id", getChatsBetweenUsers);

// Kirim pesan
router.post("/send-message", sendMessage);

// Update pesan
router.put("/:id", updateChat);

// Hapus pesan
router.delete("/:id", deleteChat);

export default router;
