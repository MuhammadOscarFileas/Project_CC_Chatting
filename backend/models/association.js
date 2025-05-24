import User from './usermodel.js';
import Chat from './chatmodel.js';
import Contact from './contactmodel.js';

// ASOSIASI CHAT
// Seorang User bisa memiliki banyak pesan yang dikirim
User.hasMany(Chat, { foreignKey: 'id_sender', as: 'SentMessages' });
// Seorang User bisa memiliki banyak pesan yang diterima
User.hasMany(Chat, { foreignKey: 'id_receiver', as: 'ReceivedMessages' });

// Setiap Chat dimiliki oleh satu User sebagai pengirim
Chat.belongsTo(User, {
    foreignKey: 'id_sender',
    as: 'Sender',
    onDelete: 'CASCADE', // <-- TAMBAHKAN INI
    onUpdate: 'CASCADE'  // <-- Tambahkan ini juga untuk konsistensi
});
// Setiap Chat dimiliki oleh satu User sebagai penerima
Chat.belongsTo(User, {
    foreignKey: 'id_receiver',
    as: 'Receiver',
    onDelete: 'CASCADE', // <-- TAMBAHKAN INI
    onUpdate: 'CASCADE'  // <-- Tambahkan ini juga untuk konsistensi
});


// ASOSIASI CONTACT
// User.hasMany(Contact, { foreignKey: 'id_useradder', as: 'AddedContacts' });
// User.hasMany(Contact, { foreignKey: 'id_userreceiver', as: 'ReceivedContacts' });
// ATAU jika satu baris kontak mendefinisikan hubungan unik antara id_useradder dan id_userreceiver
// Mungkin lebih tepat jika User memiliki banyak Contact yang dia buat
User.hasMany(Contact, { foreignKey: 'id_useradder', as: 'OwnedContacts' });
// Dan User bisa muncul sebagai kontak di banyak entri Contact
User.hasMany(Contact, { foreignKey: 'id_userreceiver', as: 'AppearsInContacts' });


// Setiap Contact dimiliki oleh satu User sebagai 'adder' (yang menambahkan)
Contact.belongsTo(User, {
    foreignKey: 'id_useradder', // Pastikan nama ini SAMA PERSIS dengan kolom di tabel Contact
    as: 'Adder',
    onDelete: 'CASCADE', // <-- TAMBAHKAN INI
    onUpdate: 'CASCADE'  // <-- Tambahkan ini juga untuk konsistensi
});
// Setiap Contact juga merujuk ke satu User sebagai 'receiver' (yang ditambahkan)
Contact.belongsTo(User, {
    foreignKey: 'id_userreceiver', // Pastikan nama ini SAMA PERSIS dengan kolom di tabel Contact
    as: 'ReceiverContact', // Mengubah alias 'Receiver' agar tidak konflik dengan alias Chat
    onDelete: 'CASCADE', // <-- TAMBAHKAN INI
    onUpdate: 'CASCADE'  // <-- Tambahkan ini juga untuk konsistensi
});

// Anda bisa menghapus ini jika tidak perlu debugging di setiap startup
// console.log(Contact.associations);
// console.log(Chat.associations);

export { User, Chat, Contact };