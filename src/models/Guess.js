const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig')
const User = require('./User')

const Guess = sequelize.define('Guess', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    ticketType: {
        type: DataTypes.STRING,
        allowNull: false,
    }, 
    numbers: {
        type: DataTypes.JSON,
        allowNull: false
    }
}, {
    timestamps: true,
})

User.hasMany(Guess, {foreignKey: 'userId'});
Guess.belongsTo(User, {foreignKey: 'userId'});

module.exports = Guess;