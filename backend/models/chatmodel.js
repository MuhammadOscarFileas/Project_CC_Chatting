import { Sequelize } from "sequelize";
import db from "../config/database.js";
import User from "./usermodel.js"; // <-- 1. Impor User Model

const { DataTypes } = Sequelize;

const Chat = db.define("Chat", {
    id_chat: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_sender: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {          // <-- 2. Tambahkan 'references'
            model: User,       //    - Merujuk ke tabel/model 'User'
            key: 'id_user'     //    - Merujuk ke kolom 'id_user' di 'User'
        },
        onDelete: 'CASCADE',   // <-- 3. Tambahkan 'onDelete'
        onUpdate: 'CASCADE'    // <-- 4. Tambahkan 'onUpdate' (praktik baik)
    },
    id_receiver: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {          // <-- 2. Tambahkan 'references'
            model: User,       //    - Merujuk ke tabel/model 'User'
            key: 'id_user'     //    - Merujuk ke kolom 'id_user' di 'User'
        },
        onDelete: 'CASCADE',   // <-- 3. Tambahkan 'onDelete'
        onUpdate: 'CASCADE'    // <-- 4. Tambahkan 'onUpdate' (praktik baik)
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW // Anda bisa juga menggunakan Sequelize.NOW
    }
}, {
    freezeTableName: true,
    timestamps: false
});

export default Chat;