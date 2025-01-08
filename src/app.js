const express = require('express');
const cors = require('cors');
const rssRoutes = require('./routes/rssRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', rssRoutes);

module.exports = app;
