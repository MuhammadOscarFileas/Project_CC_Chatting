import { Sequelize } from "sequelize";

const db = new Sequelize("chatting", "root", "",{
    host: "localhost",
    dialect: "mysql",
    logging: console.log,
});


export default db;
