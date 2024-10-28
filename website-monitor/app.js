const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const monitorRoutes = require("./routes/monitor");
const reportRoutes = require("./routes/reports");
const monitorWebsites = require("./middleware/monitor");

dotenv.config();
const app = express();
app.use(express.json());

app.use("/monitor", monitorRoutes);
app.use("/", reportRoutes);

// Start monitoring on server start
monitorWebsites();

const PORT = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT);
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.error("MongoDB connection error:", err));
