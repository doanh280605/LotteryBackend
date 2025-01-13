const express = require('express');
const cors = require('cors');
const rssRoutes = require('./routes/rssRoutes');
const sequelize = require('./config/dbConfig');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', rssRoutes);

sequelize.sync({alter: true})
    .then(() => console.log("database synced"))
    .catch((err) => console.error('Synced error', err));

module.exports = app;
