import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); 

const databaseURL = process.env.DATABASE_URL;

mongoose.connect(databaseURL)
.then(() => console.log('MongoDB connected...'))
.catch(err => console.log(err));