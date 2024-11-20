const express = require("express");
const router = express.Router();

const { getReport, getStatistics } = require("../controllers/reports");

router.get("/website/:websiteId", getReport);

router.get("/statistics", getStatistics);

module.exports = router;
