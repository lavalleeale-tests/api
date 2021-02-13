var express = require('express');
var fs = require("fs");
var forge = require('node-forge');
var auth = require('./auth.js');
var router = express.Router();
var pki = forge.pki;
var pkcs12 = forge.pkcs12;
var caCertPem = fs.readFileSync(__dirname + "/../" + "keys/alexCA.pem");
var privKey = fs.readFileSync(__dirname + "/../" + "keys/alexCA.key");

 router.post('/sign', function (req, res) {
    if (auth.authToken(req.header("api_key"))) {
    } else {
      return res.status(401).send("Incorrect Auth");
    }
    caCert = pki.certificateFromPem(caCertPem);
    key = pki.privateKeyFromPem(privKey);
    keys = pki.rsa.generateKeyPair(2048);
    cert = pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    cert.setIssuer(caCert.subject.attributes)
    cert.serialNumber = new String(new Date().getTime() / 1000);
    var attrs = [{
      name: 'commonName',
      value: req.body.hostname+'.local'
    }, {
      name: 'countryName',
      value: 'US'
    }, {
      shortName: 'ST',
      value: 'Washington'
    }, {
      name: 'localityName',
      value: 'Olympia'
    }, {
      name: 'organizationName',
      value: 'Alex Testing Inc'
    }, {
      shortName: 'OU',
      value: 'Alex CA'
    }];
    cert.setSubject(attrs);
    cert.sign(key, forge.md.sha256.create());
    var pem = pki.certificateToPem(cert);
   res.end(JSON.stringify({crt:pem,key:pki.privateKeyToPem(keys.privateKey)}))
    });
    router.post('/signClient', function (req, res) {
      if (auth.authToken(req.header("api_key"))) {
      } else {
        return res.status(401).send("Incorrect Auth");
      }
      caCert = pki.certificateFromPem(caCertPem);
      key = pki.privateKeyFromPem(privKey);
      keys = pki.rsa.generateKeyPair(2048);
      cert = pki.createCertificate();
      cert.publicKey = keys.publicKey;
      cert.validity.notBefore = new Date();
      cert.validity.notAfter = new Date();
      cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);
      cert.setIssuer(caCert.subject.attributes)
      cert.serialNumber = new String(new Date().getTime() / 1000);
      var attrs = [{
        name: 'countryName',
        value: 'US'
      }, {
        shortName: 'ST',
        value: 'Washington'
      }, {
        name: 'localityName',
        value: 'Olympia'
      }, {
        name: 'organizationName',
        value: 'Alex Testing Inc'
      }, {
        shortName: 'OU',
        value: 'Alex CA'
      }];
      cert.setSubject(attrs);
      cert.sign(key, forge.md.sha256.create());
      var crt = pkcs12.toPkcs12Asn1(keys.privateKey, cert, "")
      var p12Der = forge.asn1.toDer(crt).getBytes();
      var p12b64 = forge.util.encode64(p12Der);
     res.end(JSON.stringify({crt:p12b64}))
      });
 module.exports = router;
