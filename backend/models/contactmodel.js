import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const Contact = db.define("Contact", {
    id_contact: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_useradder: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_userreceiver: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nickname: {
        type: DataTypes.STRING
    }
}, {
    freezeTableName: true,
    timestamps: false
});

export default Contact;
