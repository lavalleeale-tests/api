const express = require('express');
const fs = require("fs");
const http = require('http')
const app = express();
const server = http.createServer(app);
const authController = require('./authController');
const sshController = require('./sshController');
const webController = require('./webController');

app.use(
  express.urlencoded({
    extended: true
  })
  )
  app.use(express.json())
  app.use('/auth', authController);
  app.use('/ssh', sshController);
  app.use('/web', webController);
  require('./chatappController')(app, server);
  

process.on('SIGINT', function() {
  server.close();
});

server.listen(8080)