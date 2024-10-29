const Website = require("../models/website");

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

    res.status(200).send({ message: "Website removed successfully" });
  } catch (err) {
    res
      .status(500)
      .send({ error: "An error occurred while deleting the website" });
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
