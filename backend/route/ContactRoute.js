import express from "express";
import {
  getMyContacts,
  addContact,
  updateContact,
  deleteContact,
} from "../controllers/contactcontroller.js";
import { verifyToken } from "../middleware/verifytoken.js";


const router = express.Router();

// GET semua kontak milik user (baik dia yang add atau di-add)
router.get("/:userId", verifyToken, getMyContacts);

// Tambah kontak dengan username target dan nickname
router.post("/add-contact", verifyToken, addContact);

// Update nickname kontak
router.put("/contact/:id", verifyToken, updateContact);

// Hapus kontak
router.delete("/contact/:id", verifyToken, deleteContact);

export default router;
