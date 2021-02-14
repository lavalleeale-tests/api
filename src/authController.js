const crypto = require('crypto');
const express = require('express');
const fs = require('fs');
const auth = require('./auth.js');

let tokens;
const router = express.Router();

router.get('/listUsers', (req, res) => {
  if (!auth.authToken(req.header('api_key'))) {
    return res.status(401).send('Incorrect Auth');
  }
  return res.end(fs.readFileSync(`${__dirname}/../keys/tokens.json`, 'utf8'));
});
router.post('/genToken', (req, res) => {
  if (!auth.authToken(req.header('api_key'))) {
    return res.status(401).send('Incorrect Auth');
  }
  const token = crypto.randomBytes(16).toString('base64');
  tokens[tokens.length] = token;
  fs.writeFileSync(`${__dirname}/../keys/tokens.json`, tokens);
  return res.end(token);
});
module.exports = router;
