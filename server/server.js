import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import cors from 'cors';
import admin from 'firebase-admin';
import { v2 as cloudinary } from 'cloudinary';
import fileUpload from 'express-fileupload';
import Memcached from 'memcached';
import serviceAccountKey from './my-blog-b74b4-firebase-adminsdk-5tzud-1eb77ebca2.json' assert { type: "json" };
import { ErrorThrow } from './utils/error.js';
import BlogRouter from './routes/blogRoutes.js';
import userRouter from './routes/userRoutes.js';
import notificationRouter from './routes/notification.js';

const server = express();
server.use(express.json());
server.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

const PORT = process.env.PORT || 3000;

// Ensure CORS middleware is applied before any routes
server.use(cors({
    origin: 'https://dev-talks-lilac.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
});

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Connect to MongoDB
mongoose.connect(process.env.DB_CONNECTION, {
    autoIndex: true
}).then(() => {
    console.log("Database connected Successfully");
}).catch((err) => {
    console.error(err);
});

// Create a Memcached client instance
const memcached = new Memcached('localhost:11211');

// Middleware to cache responses
server.use((req, res, next) => {
    const key = req.originalUrl || req.url;
    memcached.get(key, (err, data) => {
        if (err) return next(err);
        if (data != null) {
            res.send(JSON.parse(data));
        } else {
            res.sendResponse = res.send;
            res.send = (body) => {
                memcached.set(key, JSON.stringify(body), 600, (err) => {
                    if (err) console.error('Memcached set error:', err);
                });
                res.sendResponse(body);
            };
            next();
        }
    });
});

// Routes
server.get('/', (req, res) => {
    res.send("Hello from the server side");
});

server.post('/upload-image', async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({ error: 'No files were uploaded.' });
        }

        const { image } = req.files;
        const result = await cloudinary.uploader.upload(image.tempFilePath);
        // Cache the result in Memcached
        memcached.set(req.url, JSON.stringify({ "url": result.url }), 3600, (err) => {
            if (err) console.error('Memcached set error:', err);
        });
        res.status(202).json({ "url": result.url });
    } catch (err) {
        console.error('Error during image upload:', err);
        res.status(500).json({ error: err.message });
    }
});

server.use(userRouter);
server.use(BlogRouter);
server.use(notificationRouter);

server.use(ErrorThrow);

// Start the server
server.listen(PORT, () => {
    console.log("Listening on port -> " + PORT);
});
