import sequelize from '../config/dbConfig.js';
import User from './User.js';
import Guess from './Guess.js';
import Prediction from './Prediction.js';

User.hasMany(Guess, {foreignKey: 'userId', onDelete: 'CASCADE'});
Guess.belongsTo(User, {foreignKey: 'userId'});

User.hasMany(Prediction, {foreignKey: 'userId', onDelete: 'CASCADE'});
Prediction.belongsTo(User, {foreignKey: 'userId'});

sequelize.sync({alter: true})
    .then(() => console.log('Database synced'))
    .catch((err) => console.error('Failed to sync database: ', err))

export {User, Guess, Prediction};