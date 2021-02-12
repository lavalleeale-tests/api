var express = require('express');
var fs = require("fs");
var sshpk = require("sshpk");
var auth = require('./auth.js');
var router = express.Router();
var authenticated;

router.post('/renewClient', function (req, res) {
   pubKey = sshpk.parseKey(fs.readFileSync( __dirname + "/../" + "keys/sshca_key.pub", 'utf8'));
   privKey = sshpk.parsePrivateKey(fs.readFileSync( __dirname + "/../" + "keys/sshca_key", 'utf8'));
   certificate = sshpk.parseCertificate(req.body.crt, "openssh");
   if (certificate.isExpired()) {
      return res.status(401).send("Expired Key");
   } else if (!certificate.isSignedByKey(pubKey, privKey)) {
      return res.status(401).send("Incorrect Signing");
   }
   options = {lifetime:604800};
   newCrt = sshpk.createCertificate(certificate.subjects, certificate.subjectKey, certificate.issuer, privKey, options);
   newCrt.signatures.openssh.exts = certificate.getExtensions();
   newCrt.signWith(privKey);
   res.end(JSON.stringify({crt:newCrt.toString("openssh")}));
 });
 router.post('/signHost', function (req, res) {

   if (auth.authToken(req.header("api_key"))||auth.authCert(req)) {
   } else {
     return res.status(401).send("Incorrect Auth");
   }
   hostKey = sshpk.parseKey(req.body.pubkey);
   hostName = req.body.hostname
   privKey = sshpk.parsePrivateKey(fs.readFileSync( __dirname + "/../" + "keys/sshca_key", 'utf8'));
   caCert = sshpk.parseCertificate(fs.readFileSync( __dirname + "/../" + "keys/alexCA.pem", 'utf8'), "pem");
   console.log(caCert)
   hostCert = sshpk.createCertificate(sshpk.identityForHost(hostName+".local"), hostKey, caCert.subjects[0], privKey);
   hostCert.signWith(privKey)
   res.end(JSON.stringify({crt:hostCert.toString("openssh")}));
});
function auth(key) {
   data = fs.readFileSync( __dirname + "/../" + "keys/tokens.json", 'utf8');
   tokens = JSON.parse(data);
   for (i = 0; i < tokens.length; i++) {
      if (tokens[i]==tokens) {
         return true;
      }
   }
   return false;
}
 module.exports = router;
