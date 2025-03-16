import { DataTypes } from 'sequelize';
import sequelize from '../config/dbConfig.js';
import User from './User.js';

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

export default Guess;