const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const express = require("express");
const helmet = require("helmet");
const xss = require("xss-clean");
const morgan = require("morgan")
const cors = require("cors");
const hpp = require("hpp");

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./utils/globalErrorHandler');
const terminate = require("./utils/terminate")
const connectMongoDB = require("./lib/mongodb");
const wantedPersonRoutes = require("./routes/wantedPersonRoutes");
const missingPersonRoutes = require("./routes/missingPersonRoutes");
const authenticationRoutes = require("./routes/authenticationRoutes");
const newsRoutes = require("./routes/newsRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Configure App
app.use(cors({ 
    credentials: true,
    origin: ["http://127.0.0.1:3000", "http://frontend:3000", process.env.WEBSITE_URL]
}));
app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(compression());
if (process.env.NODE_ENV == "development") {
    app.use(morgan("dev"));
}

// Setup routes
app.use("/api/wanted", wantedPersonRoutes);
app.use("/api/missing", missingPersonRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/auth", authenticationRoutes);
app.use("/api/admin", adminRoutes);
app.all("*", (req, res, next) => {
    next(new AppError("Diese Seite wurde nicht gefunden.", 404));
});

app.use(globalErrorHandler);

// Start server
const startServer = async() => {
    // Connect to Database
    await connectMongoDB();

    // Run cron jobs
    require("./lib/cronjobs")

    // Start the server
    const PORT = process.env.PORT || 4000;
    const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });

    // Listen for unexpected Errors
    const exitHandler = terminate(server, {
        coredump: false,
        timeout: 500
    })

    process.on('uncaughtException', exitHandler(1, 'Unexpected Error'))
    process.on('unhandledRejection', exitHandler(1, 'Unhandled Promise'))
    process.on('SIGTERM', exitHandler(0, 'SIGTERM'))
    process.on('SIGINT', exitHandler(0, 'SIGINT'))
}

startServer();