const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig')

const User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        }
    }, {
        timestamps: true,
    }
)

module.exports = User;