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

const app = express();

app.use(cors());
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
      await monitorWebsites(user);
      console.log(`Started monitoring for user: ${user.email}`);
    }
  } catch (error) {
    console.error("Error checking logged-in users:", error);
  }
};

// Call this function when the server starts
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    app.listen(PORT);
    console.log("Connected to MongoDB");
    await checkLoggedInUsers();
  })
  .catch((err) => console.error("MongoDB connection error:", err));
