import User from "../models/usermodel.js";
import { Op } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// REGISTER
export const register = async (req, res) => {
  const { username, password, email, nickname } = req.body;

//   if (password !== confirm_password) {
//     return res.status(400).json({ message: "Password tidak sama" });
//   }

  try {
    const existing = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }]
      }
    });
    if (existing) {
      return res.status(400).json({ message: "Username atau email sudah digunakan" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      nickname,
      password: hashPassword
    });

    res.status(201).json({ message: "Registrasi berhasil", user });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Password salah" });

    const accessToken = jwt.sign(
      { id: user.id_user, username: user.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    const refreshToken = jwt.sign(
      { id: user.id_user, username: user.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    console.log(accessToken + ' ' + refreshToken);

    await User.update({ refresh_token: refreshToken }, { where: { id_user: user.id_user } });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      message: "Login berhasil",
      accessToken,
      user: {
        id_user: user.id_user,
        username: user.username,
        email: user.email || null,
        nickname: user.nickname || null
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
};


// REFRESH TOKEN
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(401);

    const user = await User.findOne({ where: { refresh_token: token } });
    if (!user) return res.sendStatus(403);

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.sendStatus(403);

      const accessToken = jwt.sign(
        { id: user.id_user, username: user.username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30s" }
      );

      res.json({ accessToken });
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(204);

    const user = await User.findOne({ where: { refresh_token: token } });
    if (!user) return res.sendStatus(204);

    await User.update({ refresh_token: null }, { where: { id_user: user.id_user } });

    res.clearCookie("refreshToken");

    res.status(200).json({ message: "Logout berhasil" });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
};

// UPDATE USER
// UPDATE USER
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const updateData = { ...req.body };

    // Jika ada password baru, hash dulu sebelum update
    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      updateData.password = hashedPassword;
    }

    await User.update(updateData, {
      where: { id_user: req.params.id }
    });

    res.status(200).json({ message: "User berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: "Gagal memperbarui user", error: error.message });
  }
};

// DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    await User.destroy({
      where: { id_user: req.params.id }
    });
    res.status(200).json({ message: "User berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus user", error: error.message });
  }
};
