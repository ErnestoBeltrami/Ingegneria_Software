import logger from './config/logger.js';
import "./config/env.js";
import mongoose from "mongoose";
import connectDB from "./config/database.js";
import app from "./app.js";
import { createRootOperatore } from "./utils/seedRoot.js";
import { seedCategorie } from "./utils/seedCategorie.js";
import { avviaScheduler } from "./utils/scheduleConsultazioni.js";

const shutdown = async (signal, server) => {
    logger.info(`${signal} received — graceful shutdown in corso...`);
    server.close(async () => {
        await mongoose.connection.close();
        logger.info("Connessione MongoDB chiusa. Uscita.");
        process.exit(0);
    });
};

const startServer = async () => {
    try {
        await connectDB();

        app.on("error", (error) => {
            logger.error("Express app error", error);
            throw error;
        });

        await createRootOperatore();
        await seedCategorie();
        avviaScheduler();

        const port = process.env.PORT || 8000;
        const server = app.listen(port, () => {
            logger.info(`Server is running on port: ${port}`);
        });

        process.on("SIGTERM", () => shutdown("SIGTERM", server));
        process.on("SIGINT",  () => shutdown("SIGINT",  server));
    } catch (error) {
        logger.error("MongoDB connection failed!", error);
        process.exit(1);
    }
};

startServer();