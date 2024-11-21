const express = require("express");

const router = express.Router();
const {
  addNewWebsite,
  removeWebsite,
  getAllWebsites,
  getWebsite,
  updateWebsite,
} = require("../controllers/website");

// Route to add a new website to monitor
router.post("/add", addNewWebsite);

// Route to remove a website
router.delete("/delete/:id", removeWebsite);

// Route to get a website by ID
router.get("/", getWebsite);

// Route to edit a website
router.put("/edit/:id", updateWebsite);

// Route to get all websites
router.get("/all", getAllWebsites);

module.exports = router;
