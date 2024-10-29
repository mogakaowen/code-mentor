const express = require("express");

const { getReport } = require("../controllers/reports");
const router = express.Router();

router.get("/:id", getReport);

module.exports = router;
