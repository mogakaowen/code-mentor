const axios = require("axios");
const cron = require("cron");
const nodemailer = require("nodemailer");
const Website = require("../models/website");
const StatusLog = require("../models/status-log");
const Report = require("../models/report");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Use a Map to associate users with their monitored websites and jobs
let monitoredUsers = new Map();
let monitoringIntervals = new Map();

async function checkWebsite(website) {
  try {
    const response = await axios.get(website.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.183 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Connection: "keep-alive",
      },
    });

    const statusCode = response.status;
    const responseTime = website.lastChecked
      ? Date.now() - new Date(website.lastChecked).getTime()
      : website.interval * 60 * 1000;

    // Log status to database
    await new StatusLog({
      websiteId: website._id,
      statusCode,
    }).save();

    // Update the website's lastChecked and status
    await Website.findByIdAndUpdate(website._id, {
      lastChecked: Date.now(),
      status: statusCode === 200 ? "up" : "down",
    });

    // Fetch or create report for this website
    let report = await Report.findOneAndUpdate(
      { websiteId: website._id },
      {
        $setOnInsert: {
          status: "up",
          availability: 100,
          outages: 0,
          downtime: 0,
          uptime: 0,
          avgResponseTime: 0,
          history: [],
        },
      },
      { upsert: true, new: true }
    );

    // Update report based on status
    if (statusCode === 200) {
      report.status = "up";
      report.uptime += responseTime / 1000;
      report.downtime = Math.max(0, report.downtime - responseTime / 1000);
    } else {
      report.status = "down";
      report.outages += 1;
      report.downtime += 60;
      sendAlert(
        website,
        `Website ${website.url} is down. Status code: ${statusCode}`
      );
    }

    // Log history
    report.history.push({
      timestamp: new Date(),
      status: report.status,
      responseTime,
    });

    // Update average response time
    report.avgResponseTime =
      (report.avgResponseTime * (report.history.length - 1) + responseTime) /
      report.history.length;

    // Calculate availability
    const totalTime = report.uptime + report.downtime;
    report.availability = totalTime
      ? ((report.uptime / totalTime) * 100).toFixed(2)
      : 100;

    await report.save();
  } catch (error) {
    const statusCode = error.response?.status || 500;
    const reason =
      error.response?.statusText || error.message || "Unknown Error";

    await new StatusLog({
      websiteId: website._id,
      statusCode,
    }).save();

    // Fetch or create report
    let report = await Report.findOneAndUpdate(
      { websiteId: website._id },
      {
        $setOnInsert: {
          status: "down",
          availability: 100,
          outages: 0,
          downtime: 0,
          uptime: 0,
          avgResponseTime: 0,
          history: [],
        },
      },
      { upsert: true, new: true }
    );

    // Update report
    report.status = "down";
    report.outages += 1;
    report.downtime += 60;
    report.history.push({
      timestamp: new Date(),
      status: "down",
      responseTime: null,
    });

    // Calculate availability safely
    const totalTime = report.uptime + report.downtime;
    report.availability =
      totalTime > 0 ? ((report.uptime / totalTime) * 100).toFixed(2) : 0;

    await report.save();

    // Update website status to down in database
    await Website.findByIdAndUpdate(website._id, {
      lastChecked: Date.now(),
      status: "down",
    });

    sendAlert(
      website,
      `Website ${website.url} check failed.\nStatus code: ${statusCode}\nReason: ${reason}`
    );
  }
}

function sendAlert(website, message) {
  const mailOptions = {
    from: process.env.USER,
    to: website.userID.email,
    subject: "Website Down Alert",
    text: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(`Failed to send alert for ${website.url}:`, error);
    } else {
      console.log(`Alert sent for ${website.url}:`, message);
    }
  });
}

function convertToCronFormat(interval) {
  if (interval < 1) {
    throw new Error("Interval must be at least 1 minute.");
  }
  return `*/${interval} * * * *`; // Cron expression for every 'n' minutes
}

function scheduleMonitoringJob(userId, website) {
  try {
    const cronExpression = convertToCronFormat(website.interval);
    const job = new cron.CronJob(cronExpression, () => {
      checkWebsite(website);
    });
    job.start();

    // Create or update user jobs map
    if (!monitoredUsers.has(userId.toString())) {
      monitoredUsers.set(userId.toString(), new Map());
    }
    monitoredUsers.get(userId.toString()).set(website._id.toString(), job);

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
  // Check if monitoring is already set up for this user
  if (monitoredUsers.has(user._id.toString())) {
    return; // Skip if already monitoring
  }

  // Fetch websites associated with the user
  const websites = await Website.find({ userID: user._id }).populate("userID");

  websites.forEach((website) => {
    if (!monitoredUsers.get(user._id.toString())?.has(website._id.toString())) {
      console.log(`Starting monitoring for: ${website.url}`);
      scheduleMonitoringJob(user._id, website);
    }
  });

  // Set an interval to check for new websites every minute
  const intervalId = setInterval(async () => {
    const updatedWebsites = await Website.find({ userID: user._id }).populate(
      "userID"
    );

    updatedWebsites.forEach((website) => {
      if (
        !monitoredUsers.get(user._id.toString())?.has(website._id.toString())
      ) {
        console.log(`Starting monitoring for: ${website.url}`);
        scheduleMonitoringJob(user._id, website);
      }
    });

    // Stop monitoring removed websites
    monitoredUsers.get(user._id.toString())?.forEach((job, websiteId) => {
      if (
        !updatedWebsites.some((website) => website._id.toString() === websiteId)
      ) {
        job.stop();
        monitoredUsers.get(user._id.toString()).delete(websiteId);
        console.log(`Stopped monitoring for removed website ID: ${websiteId}`);
      }
    });
  }, 60); // Check every second for new websites

  // Store the interval for this user
  monitoringIntervals.set(user._id.toString(), intervalId);
}

function stopMonitoring(userID) {
  const userJobs = monitoredUsers.get(userID.toString());
  const intervalId = monitoringIntervals.get(userID.toString()); // Get the interval ID

  if (userJobs) {
    userJobs.forEach((job, websiteId) => {
      job.stop();
      console.log(`Stopped monitoring for website ID: ${websiteId}`);
    });
    monitoredUsers.delete(userID.toString());
    console.log(`Stopped monitoring for user ID: ${userID}`);
  }

  if (intervalId) {
    clearInterval(intervalId); // Clear the interval
    monitoringIntervals.delete(userID.toString()); // Remove from the Map
    console.log(`Cleared monitoring interval for user ID: ${userID}`);
  }
}

module.exports = { monitorWebsites, stopMonitoring };
