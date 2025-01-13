const sequelize = require('../config/dbConfig')
const User = require('./User')
const Guess = require('./Guess')

sequelize.sync({alter: true})
    .then(() => console.log('Database synced'))
    .catch((err) => console.error('Failed to sync database: ', err))

module.exports = {User, Guess};