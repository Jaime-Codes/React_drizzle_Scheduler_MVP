var express = require("express");
var router = express.Router();
var { getAllUsers } = require("../controller/user.controller.ts");
/* GET users listing. */
router.get("/", getAllUsers);

module.exports = router;
