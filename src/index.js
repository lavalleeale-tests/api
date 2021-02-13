const express = require('express');
const fs = require("fs");
const http = require('http')
const https = require('https')
const app = express();
var privateKey  = fs.readFileSync(__dirname + "/../" + 'keys/server.key', 'utf8');
var certificate = fs.readFileSync(__dirname + "/../" + 'keys/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var httpsServer = https.createServer(credentials, app);
const authController = require('./authController');
const sshController = require('./sshController');
const webController = require('./webController');
const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests"
});

app.use("/auth/", apiLimiter);
app.use("/ssh/", apiLimiter);
app.use("/web/", apiLimiter);

app.use(
  express.urlencoded({
    extended: true
  })
  )
  app.use(express.json())
  app.use('/auth', authController);
  app.use('/ssh', sshController);
  app.use('/web', webController);
  require('./chatappController')(app, httpsServer);
  

process.on('SIGINT', function() {
  httpsServer.close();
});

httpsServer.listen(443)