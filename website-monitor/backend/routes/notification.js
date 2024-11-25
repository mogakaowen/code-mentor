const express = require("express");

const router = express.Router();
const { updateNotification } = require("../controllers/notification");

router.post("/update", updateNotification);

module.exports = router;
