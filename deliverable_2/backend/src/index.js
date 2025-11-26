import dotenv from "dotenv";
import connectDB from "./config/database.js";
import app from "./app.js";
import express from "express"

dotenv.config({
    path: new URL("../../.env", import.meta.url).pathname
  });

const startServer = async () => {
    try {
        await connectDB();

        app.on("error", (error) => {
            console.error("Express app error", error);
            throw error;
        });

        const port = process.env.PORT || 8000;
        app.listen(port, () => {
            console.log(`Server is running on port: ${port}`);
        });
    } catch (error) {
        console.error("MongoDB connection failed!", error);
        process.exit(1);
    }
};

startServer();