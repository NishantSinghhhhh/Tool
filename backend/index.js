import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import resultRoute from './Routes/ResultRoute.js';
import dotenv from 'dotenv';
import DataToJson from './Routes/DataToJson.js';
import Verification from "./Routes/Verification.js"

dotenv.config(); // Load environment variables

const PORT = process.env.PORT || 7009;
const app = express();

// Middleware setup
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// CORS configuration
app.use(cors({
    origin: process.env.BASE_URL, // Ensure this matches your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Handle preflight requests
app.options('*', cors()); // Enable CORS for all preflight OPTIONS requests

const mongoURI = process.env.MONGO_CONN;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connection established successfully'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

app.get('/', (req, res) => {
    res.json("PONG");
});


app.use('/result', resultRoute);
app.use('/datatoJson', DataToJson);
app.use('/verification', Verification);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.setHeader('Access-Control-Allow-Origin', process.env.BASE_URL); // Ensure this matches frontend URL
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(500).json({ message: 'An error occurred!' });
    next();
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
