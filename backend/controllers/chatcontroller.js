import Chat from "../models/chatmodel.js";
import Contact from "../models/contactmodel.js"; // <-- 1. Tambahkan Impor ini
import { Op } from "sequelize";

export const sendMessage = async (req, res) => {
    // ... (kode tetap sama) ...
    try {
        const { id_sender, id_receiver, message } = req.body;

        if (!message || !id_sender || !id_receiver) {
            return res.status(400).json({ msg: "Data tidak lengkap" });
        }

        await Chat.create({ id_sender, id_receiver, message });
        res.status(201).json({ msg: "Pesan berhasil dikirim" });
    } catch (error) {
        res.status(500).json({ msg: "Gagal mengirim pesan", error: error.message });
    }
};

export const getChatsBetweenUsers = async (req, res) => {
    try {
        const { user1, user2 } = req.params;

        // --- 2. Tambahkan Pemeriksaan Kontak Di Sini ---
        const areContacts = await Contact.findOne({
            where: {
                [Op.or]: [
                    // Cek apakah user1 menambahkan user2 ATAU user2 menambahkan user1
                    { id_useradder: user1, id_userreceiver: user2 },
                    { id_useradder: user2, id_userreceiver: user1 }
                ]
            }
        });

        // Jika tidak ada entri kontak sama sekali antara keduanya
        if (!areContacts) {
            console.log(`Pemeriksaan Gagal: Tidak ada kontak antara ${user1} dan ${user2}.`);
            // Kirim 403 Forbidden, karena akses ditolak (bukan lagi kontak)
            return res.status(403).json({ msg: "Anda tidak dapat melihat chat ini karena Anda bukan lagi kontak." });
        }
        // --- Akhir Pemeriksaan Kontak ---


        // Jika mereka masih kontak, lanjutkan mengambil pesan
        const messages = await Chat.findAll({
            where: {
                [Op.or]: [
                    { id_sender: user1, id_receiver: user2 },
                    { id_sender: user2, id_receiver: user1 }
                ]
            },
            order: [['timestamp', 'ASC']]
        });

        res.status(200).json(messages);

    } catch (error) {
        res.status(500).json({ msg: "Gagal mengambil chat", error: error.message });
    }
};

export const getLastChat = async (req, res) => {
    // ... (kode tetap sama, tapi idealnya juga ditambahkan cek kontak) ...
    try {
        const { user1, user2 } = req.params;

        const message = await Chat.findOne({
            where: {
                [Op.or]: [
                    { id_sender: user1, id_receiver: user2 },
                    { id_sender: user2, id_receiver: user1 }
                ]
            },
            order: [['timestamp', 'DESC']]
        });

        if (!message) return res.status(404).json({ msg: "Belum ada pesan" });

        res.status(200).json(message);
    } catch (error) {
        res.status(500).json({ msg: "Gagal mengambil pesan terakhir", error: error.message });
    }
};

export const updateChat = async (req, res) => {
    // ... (kode tetap sama) ...
    try {
        const chat = await Chat.findByPk(req.params.id);
        if (!chat) return res.status(404).json({ msg: "Pesan tidak ditemukan" });

        await Chat.update({ message: req.body.message }, {
            where: { id_chat: req.params.id }
        });
        res.status(200).json({ msg: "Pesan berhasil diperbarui" });
    } catch (error) {
        res.status(500).json({ msg: "Gagal memperbarui pesan", error: error.message });
    }
};

export const deleteChat = async (req, res) => {
    // ... (kode tetap sama) ...
    try {
        const chat = await Chat.findByPk(req.params.id);
        if (!chat) return res.status(404).json({ msg: "Pesan tidak ditemukan" });

        await Chat.destroy({
            where: { id_chat: req.params.id }
        });
        res.status(200).json({ msg: "Pesan berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ msg: "Gagal menghapus pesan", error: error.message });
    }
};