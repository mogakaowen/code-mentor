const StatusLog = require("../models/status-log");
const Report = require("../models/report");
const Website = require("../models/website");
const User = require("../models/users");

exports.getReport = async (req, res) => {
  try {
    const { email } = req.body;
    const { websiteId } = req.params;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No user found with this email." });
    }

    // Fetch the website associated with the user
    const website = await Website.findOne({ _id: websiteId, userId: user._id });
    if (!website) {
      return res
        .status(404)
        .json({ message: "No website found for this user." });
    }

    // Find the report for the specified website
    const report = await Report.findOne({ websiteId }).populate({
      path: "websiteId", // Populate the 'websiteId' field in the report with website details
      select: "url", // Select only the 'url' field from the Website model
    });

    if (!report) {
      return res
        .status(404)
        .json({ message: "No report found for this website." });
    }

    // Retrieve all logs for the specified website and user
    const logs = await StatusLog.find({ websiteId, userID: user._id }).sort({
      checkedAt: -1,
    });

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
    const { email } = req.query;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "No user found with this email." });
    }

    // Fetch all websites for the specified user
    const websites = await Website.find({ userID: user._id });

    if (!websites || websites.length === 0) {
      return res.status(200).json([]);
    }

    // Fetch all reports for the websites that belong to this user
    const reports = await Report.find({
      websiteId: { $in: websites.map((website) => website._id) },
    }).populate({
      path: "websiteId", // Populate the 'websiteId' field in the report with website details
      select: "url", // Select only the 'url' field from the Website model
    });

    if (!reports || reports.length === 0) {
      return res
        .status(404)
        .json({ message: "No reports found for this user." });
    }

    // Aggregate statistics for each website
    const statistics = reports.map((report) => {
      return {
        websiteUrl: report.websiteId.url, // Extract the URL from the populated website
        availability: report.availability,
        uptime: report.uptime / 3600000, // Convert milliseconds to hours
        downtime: report.downtime / 3600000, // Convert milliseconds to hours
        avgResponseTime: report.avgResponseTime / 1000, // Convert to seconds
      };
    });

    // Return the aggregated statistics
    res.json(statistics);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching statistics." });
  }
};
