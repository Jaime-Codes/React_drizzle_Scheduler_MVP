var express = require("express");
var router = express.Router();
// Ensure you point correctly to your controller file path
var authController = require("../controllers/auth.controller");

router.post("/login", authController.loginController);
router.post("/register", authController.registerController);
router.post("/refresh", authController.refreshController);

module.exports = router;
