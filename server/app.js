var express = require("express");
var path = require("path");
var cors = require("cors");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var homeRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var appointmentsRouter = require("./routes/appointments");
var availabilityRouter = require("./routes/availability");
var authRouter = require("./routes/auth");
var app = express();

// Enable CORS and whitelist your specific Frontend development URL
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", homeRouter);
app.use("/users", usersRouter);
app.use("/appointments", appointmentsRouter);
app.use("/availability", availabilityRouter);
app.use("/auth", authRouter);
module.exports = app;
