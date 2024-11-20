const StatusLog = require("../models/status-log");
const Report = require("../models/report");
const Website = require("../models/website");

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

exports.getStatistics = async (req, res) => {
  try {
    // Fetch all reports
    const reports = await Report.find();
    if (!reports || reports.length === 0) {
      return res
        .status(404)
        .json({ message: "No reports found for any website." });
    }

    // Aggregate statistics for each website
    const statistics = await Promise.all(
      reports.map(async (report) => {
        const website = await Website.findOne({ _id: report.websiteId });

        return {
          websiteUrl: website.url, // Assuming the URL is part of the website report
          availability: report.availability, // Availability in percentage
          uptime: report.uptime / 3600000,
          downtime: report.downtime / 3600000,
          avgResponseTime: report.avgResponseTime / 3600000,
        };
      })
    );

    // Return the aggregated statistics
    res.json(statistics);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching statistics." });
  }
};
