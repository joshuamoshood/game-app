const dotenv = require("dotenv");
//load the environment variables from .env
dotenv.config()

const port = process.env.APP_PORT || "8888";

const browserSync = require('browser-sync').create();

browserSync.init({
  proxy: 'localhost:'+port,
  files: ['**/*.*'],
  port: 3001,
  open: false,
  notify: false
});
