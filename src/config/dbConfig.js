const { Sequelize } = require('sequelize')

const sequelize = new Sequelize('lottery', 'root', 'vietnam2005', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306, 
    logging: false,
})

sequelize.authenticate()
    .then(() => console.log("Connect successfully"))
    .catch((err) => console.error("Connection failed", err))

module.exports = sequelize;