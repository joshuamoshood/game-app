const express = require("express");
const dotenv = require("dotenv");
const path = require("path")

//load the environment variables from .env
dotenv.config()

const router = require(__dirname + "/routes/game.js");

//set up the Express app
const app = express();
const port = process.env.APP_PORT || "8888";

// Middleware to parse JSON bodies
app.use(express.json()); // For JSON data
app.use(express.urlencoded({ extended: true })); // For form data

//set up application template engine
app.set("views", path.join(__dirname, "views")); //the first "views" is the setting name
//the second value above is the path: __dirname/views
app.set("view engine", "pug");

//set up folder for static files
app.use(express.static(path.join(__dirname, "public")));

//USE PAGE ROUTES FROM ROUTER(S)
app.use("/", router);

//set up server listening
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
}); 

// Require BrowserSync configuration
require('./browser-sync');
