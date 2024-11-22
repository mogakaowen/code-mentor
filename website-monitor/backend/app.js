require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const websiteRoutes = require("./routes/website");
const reportRoutes = require("./routes/reports");
const userRoutes = require("./routes/users");
const errorHandler = require("./middleware/errorHandler");
const authenticate = require("./middleware/authenticate");
const {
  deleteUnverifiedUsersJob,
  stopDeleteUnverifiedUsersJob,
} = require("./middleware/deleteUnverified");
const Users = require("./models/users");
const { monitorWebsites } = require("./middleware/monitor");
const socket = require("./socket");

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

deleteUnverifiedUsersJob();

app.use("/users", userRoutes);
app.use("/websites", authenticate, websiteRoutes);
app.use("/reports", authenticate, reportRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 8000;

// Graceful shutdown
process.on("SIGINT", () => {
  stopDeleteUnverifiedUsersJob();
  process.exit();
});

process.on("SIGTERM", () => {
  stopDeleteUnverifiedUsersJob();
  process.exit();
});

const checkLoggedInUsers = async () => {
  try {
    const users = await Users.find({ isLoggedIn: true }); // Fetch all logged-in users
    for (const user of users) {
      // Start monitoring for this user
      console.log(`Server automatic monitoring for user: ${user.email}`);
      await monitorWebsites(user);
    }
  } catch (error) {
    console.error("Error checking logged-in users:", error);
  }
};

// Call this function when the server starts
async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
}

async function startServer() {
  try {
    await connectDatabase();

    const server = app.listen(PORT);
    await checkLoggedInUsers();

    const io = socket.init(server);

    io.on("connection", (socket) => {
      console.log("Client connected:", socket?.id);
    });
  } catch (err) {
    console.error("Error starting the server:", err);
  }
}

startServer();
