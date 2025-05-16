import express from "express";
import {
  getMyContacts,
  addContact,
  updateContact,
  deleteContact,
} from "../controllers/contactcontroller.js";

const router = express.Router();

// GET semua kontak milik user (baik dia yang add atau di-add)
router.get("/:userId", getMyContacts);

// Tambah kontak dengan username target dan nickname
router.post("/add-contact", addContact);

// Update nickname kontak
router.put("/contact/:id", updateContact);

// Hapus kontak
router.delete("/contact/:id", deleteContact);

export default router;
