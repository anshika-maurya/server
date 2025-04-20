const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");
const contactUsRoute = require("./routes/Contact");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const {cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
	console.log("Uncaught Exception:", err);
	process.exit(1);
});

dotenv.config();

//database connect
try {
	database.connect();
} catch (error) {
	console.error("Database connection failed:", error);
	process.exit(1);
}

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin: ["https://educational-platform-16.vercel.app", "http://localhost:3000", "http://localhost:3001"],
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"]
	})
)

app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: "/tmp",
	})
)

//cloudinary connection
try {
	cloudinaryConnect();
} catch (error) {
	console.error("Cloudinary connection failed:", error);
}

//routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);

//default route
app.get("/", (req, res) => {
	return res.json({
		success: true,
		message: 'Your server is up and running....'
	});
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error("Error:", err);
	res.status(500).json({
		success: false,
		message: "Internal Server Error",
		error: err.message
	});
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
	console.log("Unhandled Rejection:", err);
	server.close(() => {
		process.exit(1);
	});
});

// Try to start the server on the default port, or use an alternative port if busy
const startServer = () => {
	const PORT = process.env.PORT || 4000;
	
	// Function to attempt server start on a specific port
	const attemptServerStart = (port) => {
		return new Promise((resolve, reject) => {
			const serverInstance = app.listen(port)
				.on('listening', () => {
					console.log(`Server is running at port ${port}`);
					resolve(serverInstance);
				})
				.on('error', (err) => {
					if (err.code === 'EADDRINUSE') {
						console.log(`Port ${port} is busy, trying port ${port + 1}`);
						resolve(attemptServerStart(port + 1));
					} else {
						console.error(`Failed to start server on port ${port}:`, err);
						reject(err);
					}
				});
		});
	};
	
	return attemptServerStart(PORT)
		.catch(err => {
			console.error("Failed to start server:", err);
			process.exit(1);
		});
};

const server = startServer();
