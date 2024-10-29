require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const websiteRoutes = require("./routes/website");
const reportRoutes = require("./routes/reports");
const userRoutes = require("./routes/users");
const monitorWebsites = require("./middleware/monitor");
const errorHandler = require("./middleware/errorHandler");
const authenticate = require("./middleware/authenticate");
const {
  deleteUnverifiedUsersJob,
  stopDeleteUnverifiedUsersJob,
} = require("./middleware/deleteUnverified");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

deleteUnverifiedUsersJob();

app.use("/users", userRoutes);
app.use("/websites", authenticate, websiteRoutes);
app.use("/reports", authenticate, reportRoutes);

// Start monitoring on server start
// monitorWebsites();

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

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT);
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.error("MongoDB connection error:", err));
