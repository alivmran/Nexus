const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');


const connectDb = require('./config/db');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

connectDb();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Nexus API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});