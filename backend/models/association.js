import User from './usermodel.js';
import Chat from './chatmodel.js';
import Contact from './contactmodel.js';

User.hasMany(Chat, { foreignKey: 'id_sender', as: 'SentMessages' });
User.hasMany(Chat, { foreignKey: 'id_receiver', as: 'ReceivedMessages' });
Chat.belongsTo(User, { foreignKey: 'id_sender', as: 'Sender' });
Chat.belongsTo(User, { foreignKey: 'id_receiver', as: 'Receiver' });

User.hasMany(Contact, { foreignKey: 'id_useradder', as: 'AddedContacts' });
User.hasMany(Contact, { foreignKey: 'id_userreceiver', as: 'ReceivedContacts' });
Contact.belongsTo(User, { foreignKey: 'id_useradder', as: 'Adder' });
Contact.belongsTo(User, { foreignKey: 'id_userreceiver', as: 'Receiver' });

console.log(Contact.associations);


export { User, Chat, Contact };
