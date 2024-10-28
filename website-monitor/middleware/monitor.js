const axios = require("axios");
const nodemailer = require("nodemailer");
const Website = require("../models/website");
const StatusLog = require("../models/status-log");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

let monitoredWebsites = new Map();

async function checkWebsite(website) {
  try {
    const response = await axios.get(website.url);
    const statusCode = response.status;

    // Log status to database
    await new StatusLog({ websiteId: website._id, statusCode }).save();

    if (statusCode !== 200) {
      sendAlert(
        website,
        `Website ${website.url} is down with status code ${statusCode}`
      );
    } else {
      console.log(`Website ${website.url} is up.`);
    }
  } catch (error) {
    sendAlert(website, `Website ${website.url} check failed.`);
    await new StatusLog({
      websiteId: website._id,
      statusCode: error.response?.status || 500,
    }).save();
  }
}

function sendAlert(website, message) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: website.email,
    subject: "Website Down Alert",
    text: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(`Failed to send alert for ${website.url}:`, error);
    } else {
      console.log(`Alert sent for ${website.url}:`, info.response);
    }
  });
}

function scheduleMonitoringJob(website) {
  const intervalInMs = website.interval; // Assuming the interval is in milliseconds
  const job = setInterval(() => {
    checkWebsite(website);
  }, intervalInMs);

  monitoredWebsites.set(website._id.toString(), job);
}

function monitorWebsites() {
  setInterval(async () => {
    const websites = await Website.find();

    websites.forEach((website) => {
      if (!monitoredWebsites.has(website._id.toString())) {
        // Schedule new website for monitoring
        console.log(`Starting monitoring for: ${website.url}`);
        scheduleMonitoringJob(website);
      }
    });

    // Clean up jobs for removed websites
    monitoredWebsites.forEach((job, websiteId) => {
      if (!websites.some((website) => website._id.toString() === websiteId)) {
        clearInterval(job); // Stop the interval job
        monitoredWebsites.delete(websiteId);
        console.log(`Stopped monitoring for removed website ID: ${websiteId}`);
      }
    });
  }, 60000); // Check for new websites every 1 minute
}

module.exports = monitorWebsites;
