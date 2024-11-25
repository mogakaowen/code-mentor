const Notification = require("../models/notification");

// Update website details
exports.updateWebsite = async (req, res) => {
  const { email, phone } = req.body;

  try {
    const notification = await Notification.findOneAndUpdate(
      { userID: req.user.id },
      { email, phone },
      { new: true }
    );

    if (!notification) {
      return res
        .status(404)
        .send({ error: "User not found or not authorized" });
    }

    const currentUser = {
      ...req.user,
      _id: req.user.id,
    };

    await stopMonitoring(currentUser.id); // Stop monitoring for the user to update the interval
    await monitorWebsites(currentUser); // Restart monitoring with the updated interval

    res.send({ message: "Website updated successfully", website });
  } catch (err) {
    console.error(err, req.user);
    res
      .status(500)
      .send({ error: "An error occurred while updating the website" });
  }
};
