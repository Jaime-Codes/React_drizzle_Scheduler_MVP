var express = require("express");
var router = express.Router();


router.get("/", function (req, res, next) {
  res.send("TODO availability page");
});

module.exports = router;
