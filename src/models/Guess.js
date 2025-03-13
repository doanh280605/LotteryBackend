const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig')
const User = require('./User')

const Guess = sequelize.define('Guess', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    ticketType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ticketTurn: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    numbers: {
        type: DataTypes.JSON,
        allowNull: false
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    }
}, {
    timestamps: true,
})

module.exports = Guess;