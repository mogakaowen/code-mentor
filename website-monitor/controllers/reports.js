const StatusLog = require("../models/status-log");
const Report = require("../models/report");

exports.getReport = async (req, res) => {
  try {
    const { websiteId } = req.params;

    // Find the report for the specified website
    const report = await Report.findOne({ websiteId });
    if (!report) {
      return res
        .status(404)
        .json({ message: "No report found for this website." });
    }

    // Retrieve all logs for the specified website
    const logs = await StatusLog.find({ websiteId }).sort({ checkedAt: -1 });

    // Send the combined report and logs
    res.json({
      report,
      logs,
    });
  } catch (error) {
    console.error("Error fetching report and logs:", error);
    res.status(500).json({
      message: "An error occurred while fetching the report and logs.",
    });
  }
};
