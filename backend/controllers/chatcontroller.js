import Chat from "../models/chatmodel.js";
import Contact from "../models/contactmodel.js"; // <-- Impor model Contact
import { Op } from "sequelize";

// Fungsi sendMessage (Tetap Sama)
export const sendMessage = async (req, res) => {
    try {
        const { id_sender, id_receiver, message } = req.body;

        if (!message || !id_sender || !id_receiver) {
            return res.status(400).json({ msg: "Data tidak lengkap" });
        }

        // TODO: Anda MUNGKIN ingin menambahkan cek kontak di sini juga,
        // agar user tidak bisa mengirim pesan ke orang yang sudah menghapusnya.
        // Tapi untuk sekarang, kita fokus pada getChats.

        await Chat.create({ id_sender, id_receiver, message });
        res.status(201).json({ msg: "Pesan berhasil dikirim" });
    } catch (error) {
        res.status(500).json({ msg: "Gagal mengirim pesan", error: error.message });
    }
};

// Fungsi getChatsBetweenUsers (Dengan Modifikasi Cek Kontak)
export const getChatsBetweenUsers = async (req, res) => {
    try {
        const { user1, user2 } = req.params;

        // --- PEMERIKSAAN KONTAK DITAMBAHKAN ---
        const areContacts = await Contact.findOne({
            where: {
                [Op.or]: [
                    { id_useradder: user1, id_userreceiver: user2 },
                    { id_useradder: user2, id_userreceiver: user1 }
                ]
            }
        });

        // Jika tidak ada hubungan kontak ditemukan
        if (!areContacts) {
            // Kirim 403 Forbidden. Frontend akan menangani ini.
            return res.status(403).json({ msg: "Anda tidak dapat melihat chat ini karena Anda bukan lagi kontak." });
        }
        // --- AKHIR PEMERIKSAAN KONTAK ---

        // Jika masih kontak, ambil pesan
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

// Fungsi getLastChat (Tetap Sama, tapi idealnya juga ditambah cek kontak)
export const getLastChat = async (req, res) => {
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

// Fungsi updateChat (Tetap Sama)
export const updateChat = async (req, res) => {
    try {
        const chat = await Chat.findByPk(req.params.id);
        if (!chat) return res.status(404).json({ msg: "Pesan tidak ditemukan" });

        // TODO: Tambahkan cek otorisasi, pastikan user yang mengedit adalah pengirim pesan.

        await Chat.update({ message: req.body.message }, {
            where: { id_chat: req.params.id }
        });
        res.status(200).json({ msg: "Pesan berhasil diperbarui" });
    } catch (error) {
        res.status(500).json({ msg: "Gagal memperbarui pesan", error: error.message });
    }
};

// Fungsi deleteChat (Tetap Sama)
export const deleteChat = async (req, res) => {
    try {
        const chat = await Chat.findByPk(req.params.id);
        if (!chat) return res.status(404).json({ msg: "Pesan tidak ditemukan" });

        // TODO: Tambahkan cek otorisasi, pastikan user yang menghapus adalah pengirim pesan.

        await Chat.destroy({
            where: { id_chat: req.params.id }
        });
        res.status(200).json({ msg: "Pesan berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ msg: "Gagal menghapus pesan", error: error.message });
    }
};