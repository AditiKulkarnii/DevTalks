import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import cors from 'cors';
import admin from 'firebase-admin';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream'; // Import Readable stream
import multer from 'multer'; // Import multer for handling multipart/form-data
import serviceAccountKey from './my-blog-b74b4-firebase-adminsdk-5tzud-1eb77ebca2.json';
import { ErrorThrow } from './utils/error.js';
import BlogRouter from './routes/blogRoutes.js';
import userRouter from './routes/userRoutes.js';
import notificationRouter from './routes/notification.js';

const server = express();
server.use(express.json());
const PORT = process.env.PORT || 3000; // Use PORT provided by Vercel or default to 3000
server.use(cors());
server.use(cors({
    origin: 'https://dev-talks-lilac.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

mongoose.connect(process.env.DB_CONNECTION, {
    autoIndex: true
}).then(()=>{
    console.log("Database connected Successfully")
}).catch((err)=>{
    console.error(err)
});

server.get('/', (req, res) =>{
    res.send("Hello from the server side");
});

// Use multer middleware to handle file upload
const upload = multer();

server.post('/upload-image', upload.single('image'), async (req, res)=>{
    try {
        const fileStream = cloudinary.uploader.upload_stream((error, result) => {
            if (error) {
                return res.status(500).json({ error: error });
            }
            return res.status(202).json({ "url": result.url });
        });

        // Pipe the file buffer from the request to the cloudinary upload stream
        Readable.from(req.file.buffer).pipe(fileStream);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
});

server.use(userRouter);
server.use(BlogRouter);
server.use(notificationRouter);
server.use(ErrorThrow);

server.listen(PORT, ()=>{
    console.log("Listening on port ->" + PORT);
});
