import express from 'express';
import cors from 'cors';
import rssRoutes from './routes/rssRoutes.js';
import sequelize from './config/dbConfig.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', rssRoutes);

sequelize.sync({alter: true})
    .then(() => console.log("database synced"))
    .catch((err) => console.error('Synced error', err));

export default app;
