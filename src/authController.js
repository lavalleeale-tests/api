var crypto = require("crypto")
var express = require('express');
var fs = require("fs");
var auth = require('./auth.js');
var token;
var router = express.Router();

router.get('/listUsers', function (req, res) {
   if (auth.authToken(req.header("api_key"))) {
   } else {
     return res.status(401).send("Incorrect Auth");
   }
    fs.readFile( __dirname + "/../" + "keys/tokens.json", 'utf8', function (err, data) {
       return res.end( data );
    });
 })
 router.post('/genToken', function (req, res) {
   if (auth.authToken(req.header("api_key"))) {
   } else {
     return res.status(401).send("Incorrect Auth");
   }
    token = crypto.randomBytes(16).toString("base64")
    console.log(token)
    tokens[tokens.length] = token
    fs.writeFileSync(__dirname + "/../" + "keys/tokens.json", tokens)
    return res.end(token)
    });
 module.exports = router;