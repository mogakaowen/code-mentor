const express = require("express");

const router = express.Router();
const {
  addNewWebsite,
  removeWebsite,
  getAllWebsites,
} = require("../controllers/monitor");

// Route to add a new website to monitor
router.post("/add", addNewWebsite);

// Route to remove a website
router.delete("/delete/:id", removeWebsite);

// Route to get all websites
router.get("/all", getAllWebsites);

module.exports = router;
