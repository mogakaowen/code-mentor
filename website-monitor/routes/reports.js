const express = require("express");
const router = express.Router();

const { getReport } = require("../controllers/reports");

router.get("/:websiteId", getReport);

module.exports = router;
