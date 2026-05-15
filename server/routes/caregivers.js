var express = require("express");
var router = express.Router();
var caregiverController = require("../controllers/caregivers.controller");

router.get(
  "/:caregiverId/dashboard",
  caregiverController.getCaregiverDashboardData,
);

router.patch(
  "/appointments/:appointmentId/status",
  caregiverController.updateAppointmentStatus,
);

module.exports = router;
