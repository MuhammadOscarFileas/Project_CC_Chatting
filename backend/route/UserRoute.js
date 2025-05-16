import express from "express";
import {
  updateUser,
  deleteUser,
  register,
  login,
} from "../controllers/usercontroller.js";

const router = express.Router();

//router.get("/", getAllUsers);
router.post("/login", login);
router.post("/register", register);
router.put("/user/:id", updateUser);
router.delete("/user/:id", deleteUser);

export default router;
