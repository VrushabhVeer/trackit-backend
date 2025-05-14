import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const url = process.env.MONGODB_URI;
if (!url) throw new Error("MONGODB_URI is not defined in .env");

const databaseConnection = async () => {
    try {
        await mongoose.connect(url, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10,
        });
        console.log("MongoDB connected successfully");

        mongoose.connection.on("error", (err) =>
            console.error("MongoDB connection error:", err)
        );
        mongoose.connection.on("disconnected", () =>
            console.warn("MongoDB disconnected")
        );

        process.on("SIGINT", async () => {
            await mongoose.connection.close();
            process.exit(0);
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
};

export default databaseConnection;