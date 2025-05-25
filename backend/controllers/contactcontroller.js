import Contact from "../models/contactmodel.js";
import User from "../models/usermodel.js";
import { Op } from "sequelize";

// GET My Contacts (pakai param :id)
export const getMyContacts = async (req, res) => {
    try {
        // Ambil ID user dari parameter URL. Pastikan nama parameter di route Anda
        // cocok dengan 'userId' atau sesuaikan 'req.params.userId' ini.
        const myId = req.params.userId;

        const contacts = await Contact.findAll({
            where: {
                id_useradder: myId // Hanya kontak yang dia tambahkan
            },
            include: [
                {
                    model: User,
                    as: "ReceiverContact", // <-- UBAH KE ALIAS YANG BENAR
                    attributes: ["id_user", "username", "nickname", "email"]
                }
            ]
        });

        // Mapping hasil untuk disesuaikan dengan format yang mungkin diharapkan frontend
        const result = contacts.map(contact => {
            // Periksa jika 'ReceiverContact' ada sebelum mengaksesnya
            if (!contact.ReceiverContact) {
                console.warn(`Kontak ${contact.id_contact} tidak memiliki ReceiverContact.`);
                return null; // Atau handle sesuai kebutuhan
            }

            const target = contact.ReceiverContact; // <-- GUNAKAN NAMA ALIAS YANG BENAR

            return {
                id_contact: contact.id_contact,
                nickname: contact.nickname,
                user: {
                    id_user: target.id_user,
                    username: target.username,
                    email: target.email
                }
            };
        }).filter(item => item !== null); // Hapus item null jika ada

        res.status(200).json(result);
    } catch (error) {
        // Tambahkan console.error untuk debugging di backend
        console.error("Error fetching contacts:", error);
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

    // Cek apakah relasi sudah ada di salah satu arah
    const existing = await Contact.findOne({
      where: {
        [Op.or]: [
          { id_useradder: id_user, id_userreceiver: userToAdd.id_user },
          { id_useradder: userToAdd.id_user, id_userreceiver: id_user }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({ msg: "Kontak sudah ada di salah satu arah" });
    }

    // Tambahkan dua arah
    const contact1 = await Contact.create({
      id_useradder: id_user,
      id_userreceiver: userToAdd.id_user,
      nickname: nickname || userToAdd.nickname
    });

    const user = await User.findByPk(id_user);

    const contact2 = await Contact.create({
      id_useradder: userToAdd.id_user,
      id_userreceiver: id_user,
      nickname: user.username // atau bisa isi dengan default dari user A kalau mau
    });

    res.status(201).json({ 
      msg: "Kontak dua arah berhasil ditambahkan", 
      contacts: [contact1, contact2] 
    });
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
    const id_contact = req.params.id;

    // Cari kontak 1 arah dulu
    const contact = await Contact.findByPk(id_contact);
    if (!contact) return res.status(404).json({ msg: "Kontak tidak ditemukan" });

    // Hapus kontak 1 arah
    await Contact.destroy({ where: { id_contact } });

    // Hapus kontak balikannya (2 arah)
    await Contact.destroy({
      where: {
        id_useradder: contact.id_userreceiver,
        id_userreceiver: contact.id_useradder
      }
    });

    res.status(200).json({ msg: "Kontak dua arah berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ msg: "Gagal menghapus kontak", error: error.message });
  }
};
