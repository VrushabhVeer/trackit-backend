import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import databaseConnection from "./config/database.js";
import userRouter from "./routes/user.routes.js";
import jobsRouter from "./routes/job.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

// Security Middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX || 100 // configurable
});
app.use(limiter);

// CORS setup
app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true
}));

app.use(express.json());

// Routes
app.get("/", (req, res) => {
    res.send("Welcome to the trackit backend");
});
app.use("/api/users", userRouter);
app.use("/api/jobs", jobsRouter);

// 404 Handler
app.use((req, res, next) => {
    res.status(404).send("Not Found");
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const status = err.status || 500;
    res.status(status).json({
        error: {
            message: err.message || 'Something went wrong!',
            status
        }
    });
});

// Database Connection and Server Start
databaseConnection()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB", error);
        process.exit(1);
    });
