require('dotenv').config();
const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
        ssl: {
            require: true, 
            rejectUnauthorized: false,
        },
    },
    logging: false
});

sequelize.authenticate()
    .then(() => console.log("Connect successfully"))
    .catch((err) => console.error("Connection failed", err))

module.exports = sequelize;