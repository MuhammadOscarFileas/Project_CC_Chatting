import User from "../models/usermodel.js";
import { Op } from "sequelize";

// Register
export const register = async (req, res) => {
    try {
        const { username, password, email, nickname } = req.body;

        // Cek jika username atau email sudah ada
        const existing = await User.findOne({
            where: {
                [Op.or]: [{ username }, { email }]
            }
        });
        if (existing) {
            return res.status(400).json({ msg: "Username atau email sudah digunakan" });
        }

        const user = await User.create({ username, password, email, nickname });
        res.status(201).json({ msg: "Registrasi berhasil", user });
    } catch (error) {
        res.status(500).json({ msg: "Terjadi kesalahan server", error: error.message });
    }
};

// Login
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ where: { username } });
        if (!user || user.password !== password) {
            return res.status(401).json({ msg: "Username atau password salah" });
        }

        res.status(200).json({ msg: "Login berhasil", user });
    } catch (error) {
        res.status(500).json({ msg: "Terjadi kesalahan server", error: error.message });
    }
};

// Update User
export const updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

        await User.update(req.body, {
            where: { id_user: req.params.id }
        });
        res.status(200).json({ msg: "User berhasil diperbarui" });
    } catch (error) {
        res.status(500).json({ msg: "Gagal memperbarui user", error: error.message });
    }
};

// Delete User
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

        await User.destroy({
            where: { id_user: req.params.id }
        });
        res.status(200).json({ msg: "User berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ msg: "Gagal menghapus user", error: error.message });
    }
};


// // Get Profile
// export const getProfile = async (req, res) => {
//     try {
//         const user = await User.findByPk(req.params.id);
//         if (!user) return res.status(404).json({ msg: "Pengguna tidak ditemukan" });

//         res.status(200).json(user);
//     } catch (error) {
//         res.status(500).json({ msg: "Terjadi kesalahan server", error: error.message });
//     }
// };
