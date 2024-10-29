const axios = require("axios");
const cron = require("cron");
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
    const statusLog = await new StatusLog({
      websiteId: website._id,
      statusCode,
    }).save();

    // Update the website's lastChecked to the current date
    await Website.findByIdAndUpdate(website._id, {
      lastChecked: statusLog.checkedAt,
      status: statusCode === 200 ? "up" : "down",
    });

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

    // Update the website's lastChecked to the current date on error as well
    await Website.findByIdAndUpdate(website._id, {
      lastChecked: Date.now(),
      status: "down",
    });
  }
}

function sendAlert(website, message) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: website.user.email,
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

function convertToCronFormat(interval) {
  if (interval < 1) {
    throw new Error("Interval must be at least 1 minute.");
  }
  return `*/${interval} * * * *`; // Cron expression for every 'n' minutes
}

function scheduleMonitoringJob(website) {
  try {
    const cronExpression = convertToCronFormat(website.interval);
    const job = new cron.CronJob(cronExpression, () => {
      checkWebsite(website);
    });
    job.start();
    monitoredWebsites.set(website._id.toString(), job);
    console.log(
      `Scheduled monitoring job for ${website.url} with interval ${website.interval} minutes`
    );
  } catch (error) {
    console.error(
      `Error scheduling monitoring job for ${website.url}:`,
      error.message
    );
  }
}

async function monitorWebsites(user) {
  console.log(user);
  // Check if monitoring is already set up for this user
  if (monitoredWebsites.has(user._id.toString())) {
    return; // Skip if already monitoring
  }

  // Fetch websites associated with the user
  const websites = await Website.find({ userID: user._id }).populate("userID");

  websites.forEach((website) => {
    if (!monitoredWebsites.has(website._id.toString())) {
      console.log(`Starting monitoring for: ${website.url}`);
      scheduleMonitoringJob(website);
    }
  });

  // Set an interval to check for new websites every minute
  setInterval(async () => {
    const updatedWebsites = await Website.find({ userID: user._id }).populate(
      "userID"
    );

    updatedWebsites.forEach((website) => {
      if (!monitoredWebsites.has(website._id.toString())) {
        console.log(`Starting monitoring for: ${website.url}`);
        scheduleMonitoringJob(website);
      }
    });

    // Clean up jobs for removed websites
    monitoredWebsites.forEach((job, websiteId) => {
      if (
        !updatedWebsites.some((website) => website._id.toString() === websiteId)
      ) {
        job.stop();
        monitoredWebsites.delete(websiteId);
        console.log(`Stopped monitoring for removed website ID: ${websiteId}`);
      }
    });
  }, 60000); // Check for new websites every 1 minute
}

function stopMonitoring(userID) {
  const job = monitoredWebsites.get(userID.toString());
  if (job) {
    job.stop(); // Stop the cron job
    monitoredWebsites.delete(userID.toString()); // Remove from the map
    console.log(`Stopped monitoring for user ID: ${userID}`);
  }
}

module.exports = { monitorWebsites, stopMonitoring };
