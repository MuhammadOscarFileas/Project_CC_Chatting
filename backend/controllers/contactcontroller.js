import Contact from "../models/contactmodel.js";
import User from "../models/usermodel.js";
import { Op } from "sequelize";

// GET My Contacts (pakai param :id)
export const getMyContacts = async (req, res) => {
    try {
        const myId = req.params.id; 

        const contacts = await Contact.findAll({
            where: {
                [Op.or]: [
                    { id_useradder: myId },
                    { id_userreceiver: myId }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'Receiver',
                    attributes: ['id_user', 'username', 'nickname', 'email']
                },
                {
                    model: User,
                    as: 'Adder',
                    attributes: ['id_user', 'username', 'nickname', 'email']
                }
            ]
        });

        // Transformasi data agar frontend mudah pakai
        const result = contacts.map(contact => {
            const isAdder = contact.id_useradder == myId;
            const targetUser = isAdder ? contact.Receiver : contact.Adder;

            return {
                id_contact: contact.id_contact,
                nickname: contact.nickname || targetUser.nickname,
                user: {
                    id_user: targetUser.id_user,
                    username: targetUser.username,
                    email: targetUser.email
                }
            };
        });

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ msg: "Gagal mengambil kontak", error: error.message });
    }
};


// ADD Contact by Username (pakai body: id_user + username)
export const addContact = async (req, res) => {
    try {
        const { id_user, username, nickname } = req.body;

        const userToAdd = await User.findOne({ where: { username } });
        if (!userToAdd) {
            return res.status(404).json({ msg: "Username tidak ditemukan" });
        }

        if (userToAdd.id_user === id_user) {
            return res.status(400).json({ msg: "Tidak bisa menambahkan diri sendiri sebagai kontak" });
        }

        // Cek apakah kontak sudah ada (baik adder/receiver)
        const existing = await Contact.findOne({
            where: {
                [Op.or]: [
                    { id_useradder: id_user, id_userreceiver: userToAdd.id_user },
                    { id_useradder: userToAdd.id_user, id_userreceiver: id_user }
                ]
            }
        });

        if (existing) {
            return res.status(400).json({ msg: "Kontak sudah ada" });
        }

        const newContact = await Contact.create({
            id_useradder: id_user,
            id_userreceiver: userToAdd.id_user,
            nickname: nickname || userToAdd.nickname
        });

        res.status(201).json({ msg: "Kontak berhasil ditambahkan", contact: newContact });
    } catch (error) {
        res.status(500).json({ msg: "Gagal menambahkan kontak", error: error.message });
    }
};

// Update Contact Nickname
export const updateContact = async (req, res) => {
    try {
        const contact = await Contact.findByPk(req.params.id);
        if (!contact) return res.status(404).json({ msg: "Kontak tidak ditemukan" });

        await Contact.update({ nickname: req.body.nickname }, {
            where: { id_contact: req.params.id }
        });
        res.status(200).json({ msg: "Nickname kontak diperbarui" });
    } catch (error) {
        res.status(500).json({ msg: "Gagal memperbarui kontak", error: error.message });
    }
};

// Delete Contact
export const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findByPk(req.params.id);
        if (!contact) return res.status(404).json({ msg: "Kontak tidak ditemukan" });

        await Contact.destroy({
            where: { id_contact: req.params.id }
        });
        res.status(200).json({ msg: "Kontak berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ msg: "Gagal menghapus kontak", error: error.message });
    }
};
