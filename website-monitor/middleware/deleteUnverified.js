const cron = require("cron");
const User = require("../models/users");

let job;

const deleteUnverifiedUsersJob = () => {
  job = new cron.CronJob("0 * * * *", async () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    try {
      const result = await User.deleteMany({
        verified: false,
        createdAt: { $lt: oneHourAgo },
      });
      console.log(`Deleted ${result.deletedCount} unverified users.`);
    } catch (err) {
      console.error("Error deleting unverified users:", err);
    }
  });

  job.start(); // Start the cron job
  console.log("Cron job for deleting unverified users is scheduled.");
};

// Function to stop the job
const stopDeleteUnverifiedUsersJob = () => {
  if (job) {
    job.stop();
    console.log("Cron job for deleting unverified users has been stopped.");
  }
};

module.exports = { deleteUnverifiedUsersJob, stopDeleteUnverifiedUsersJob };
