const Website = require("../models/website");
const StatusLog = require("../models/status-log");
const Report = require("../models/report");

// Add a new website to monitor
exports.addNewWebsite = async (req, res) => {
  const { url, interval } = req.body;
  const userID = req.user.id;

  try {
    const website = new Website({ url, interval, userID });
    await website.save();
    res.status(201).send({ message: "Website added successfully", website });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

// Remove a website from monitoring
exports.removeWebsite = async (req, res) => {
  try {
    const website = await Website.findOneAndDelete({
      _id: req.params.id,
      userID: req.user.id,
    });

    if (!website) {
      return res
        .status(404)
        .send({ error: "Website not found or not authorized" });
    }

    // Delete associated status logs and reports
    await StatusLog.deleteMany({ websiteId: website._id });
    await Report.deleteMany({ websiteId: website._id });

    res.status(200).send({ message: "Website removed successfully" });
  } catch (err) {
    res
      .status(500)
      .send({ error: "An error occurred while deleting the website" });
  }
};

// Fetch website using ID
exports.getWebsite = async (req, res) => {
  try {
    const website = await Website.findOne({
      _id: req.query.id,
      userID: req.user.id,
    });

    if (!website) {
      return res
        .status(404)
        .send({ error: "Website not found or not authorized" });
    }

    res.send({ website });
  } catch (err) {
    res.status(500).send({ error: "Website does not exist" });
  }
};

// Update website details
exports.updateWebsite = async (req, res) => {
  const { url, interval } = req.body;

  try {
    const website = await Website.findOneAndUpdate(
      { _id: req.params.id, userID: req.user.id },
      { url, interval },
      { new: true }
    );

    if (!website) {
      return res
        .status(404)
        .send({ error: "Website not found or not authorized" });
    }

    res.send({ message: "Website updated successfully", website });
  } catch (err) {
    res
      .status(500)
      .send({ error: "An error occurred while updating the website" });
  }
};

// Get all websites for the authenticated user
exports.getAllWebsites = async (req, res) => {
  try {
    const websites = await Website.find({ userID: req.user.id });
    res.send({ websites });
  } catch (err) {
    res.status(500).send({ error: "Could not retrieve websites" });
  }
};
