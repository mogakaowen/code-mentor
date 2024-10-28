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
        job.stop();
        monitoredWebsites.delete(websiteId);
        console.log(`Stopped monitoring for removed website ID: ${websiteId}`);
      }
    });
  }, 60000); // Check for new websites every 1 minute
}

module.exports = monitorWebsites;
