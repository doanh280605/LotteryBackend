import { DataTypes } from 'sequelize';
import sequelize from '../config/dbConfig.js';

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

export default User;