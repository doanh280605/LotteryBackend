const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const Prediction = sequelize.define('Prediction', {
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
    predictedNumbers: {
        type: DataTypes.JSON,
        allowNull: false,
    }
}, {
    timestamps: true,
});

module.exports = Prediction;
