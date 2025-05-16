import { Sequelize } from "sequelize";

const db = new Sequelize("chatting", "root", "",{
    host: "localhost",
    dialect: "mysql",
    logging: console.log,
});

// crud api = nama db

export default db;
