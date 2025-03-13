const sequelize = require('../config/dbConfig')
const User = require('./User')
const Guess = require('./Guess')
const Prediction = require('./Prediction')

User.hasMany(Guess, {foreignKey: 'userId', onDelete: 'CASCADE'});
Guess.belongsTo(User, {foreignKey: 'userId'});

User.hasMany(Prediction, {foreignKey: 'userId', onDelete: 'CASCADE'});
Prediction.belongsTo(User, {foreignKey: 'userId'});

sequelize.sync({alter: true})
    .then(() => console.log('Database synced'))
    .catch((err) => console.error('Failed to sync database: ', err))

module.exports = {User, Guess, Prediction};