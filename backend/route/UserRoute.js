import express from "express";
import {
  updateUser,
  deleteUser,
  register,
  login,
  refreshToken,
} from "../controllers/usercontroller.js";
import { verifyToken } from "../middleware/verifytoken.js";

const router = express.Router();

//router.get("/", getAllUsers);
router.post("/login", login);
router.post("/register", register);
router.put("/user/:id", verifyToken, updateUser);
router.delete("/user/:id", verifyToken, deleteUser);
router.get("/token", refreshToken);

export default router;
