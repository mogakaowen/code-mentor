require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const monitorRoutes = require("./routes/monitor");
const reportRoutes = require("./routes/reports");
const userRoutes = require("./routes/users");
const monitorWebsites = require("./middleware/monitor");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/users", userRoutes);
app.use("/monitor", monitorRoutes);
app.use("/", reportRoutes);

// Start monitoring on server start
// monitorWebsites();

const PORT = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT);
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.error("MongoDB connection error:", err));
