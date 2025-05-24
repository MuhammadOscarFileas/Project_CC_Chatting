import { Sequelize } from "sequelize";
import db from "../config/database.js";
import User from "./usermodel.js"; // <-- 1. Impor User Model

const { DataTypes } = Sequelize;

const Contact = db.define("Contact", {
    id_contact: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_useradder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {        // <-- 2. Tambahkan 'references'
            model: User,       //    - Merujuk ke tabel/model 'User'
            key: 'id_user'     //    - Merujuk ke kolom 'id_user' di 'User'
        },
        onDelete: 'CASCADE',   // <-- 3. Tambahkan 'onDelete'
        onUpdate: 'CASCADE'    // <-- 4. Tambahkan 'onUpdate'
    },
    id_userreceiver: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {        // <-- 2. Tambahkan 'references'
            model: User,       //    - Merujuk ke tabel/model 'User'
            key: 'id_user'     //    - Merujuk ke kolom 'id_user' di 'User'
        },
        onDelete: 'CASCADE',   // <-- 3. Tambahkan 'onDelete'
        onUpdate: 'CASCADE'    // <-- 4. Tambahkan 'onUpdate'
    },
    nickname: {
        type: DataTypes.STRING
    }
}, {
    freezeTableName: true,
    timestamps: false
});

export default Contact;