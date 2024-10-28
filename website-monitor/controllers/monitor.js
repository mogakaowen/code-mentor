const Website = require("../models/website");

// Add a new website to monitor
exports.addNewWebsite = async (req, res) => {
  const { url, email, interval } = req.body;
  try {
    const website = new Website({ url, email, interval });
    await website.save();
    res.status(201).send(website);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

// Remove a website from monitoring
exports.removeWebsite = async (req, res) => {
  try {
    await Website.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(404).send({ error: "Website not found" });
  }
};

// get all websites
exports.getAllWebsites = async (req, res) => {
  try {
    const websites = await Website.find();
    res.send(websites);
  } catch (err) {
    res.status(500).send({ error: "Could not get websites" });
  }
};
