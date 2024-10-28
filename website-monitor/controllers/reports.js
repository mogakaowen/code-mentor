const StatusLog = require("../models/status-log");

exports.getReport = async (req, res) => {
  try {
    const logs = await StatusLog.find({ websiteId: req.params.id });
    const totalChecks = logs.length;
    const successfulChecks = logs.filter(
      (log) => log.statusCode === 200
    ).length;
    const uptimePercentage = (successfulChecks / totalChecks) * 100;

    res.send({
      totalChecks,
      successfulChecks,
      uptimePercentage,
      logs,
    });
  } catch (err) {
    res.status(500).send({ error: "Could not generate report" });
  }
};
