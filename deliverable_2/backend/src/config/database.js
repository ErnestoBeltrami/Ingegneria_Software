import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";

const connectDB = async () => {
    const connectionURI = process.env.MONGODB_URI || `mongodb://127.0.0.1:27017/${DB_NAME}`;

    if (!process.env.MONGODB_URI) {
        console.warn("MONGODB_URI not set. Falling back to local MongoDB instance.");
    }

    try {
        const connectionInstance = await mongoose.connect(connectionURI, {
            dbName: DB_NAME
        });
        console.log(`Connected to MongoDB: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("Connection to MongoDB failed", error);
        process.exit(1);
    }
};

export default connectDB;