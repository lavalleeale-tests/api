const express = require('express');
const fs = require('fs');
const forge = require('node-forge');
const auth = require('./auth.js');

const router = express.Router();
const { pki } = forge;
const { pkcs12 } = forge;
const caCertPem = fs.readFileSync(`${__dirname}/../keys/alexCA.pem`);
const privKey = fs.readFileSync(`${__dirname}/../keys/alexCA.key`);

router.post('/sign', (req, res) => {
  if (!auth.authToken(req.header('api_key'))) {
    return res.status(401).send('Incorrect Auth');
  }
  const caCert = pki.certificateFromPem(caCertPem);
  const key = pki.privateKeyFromPem(privKey);
  const keys = pki.rsa.generateKeyPair(2048);
  const cert = pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  cert.setIssuer(caCert.subject.attributes);
  cert.serialNumber = (new Date().getTime() / 1000).toString();
  const attrs = [{
    name: 'commonName',
    value: `${req.body.hostname}.local`,
  }, {
    name: 'countryName',
    value: 'US',
  }, {
    shortName: 'ST',
    value: 'Washington',
  }, {
    name: 'localityName',
    value: 'Olympia',
  }, {
    name: 'organizationName',
    value: 'Alex Testing Inc',
  }, {
    shortName: 'OU',
    value: 'Alex CA',
  }];
  cert.setSubject(attrs);
  cert.sign(key, forge.md.sha256.create());
  const pem = pki.certificateToPem(cert);
  return res.end(JSON.stringify({ crt: pem, key: pki.privateKeyToPem(keys.privateKey) }));
});
router.post('/signClient', (req, res) => {
  if (!auth.authToken(req.header('api_key'))) {
    return res.status(401).send('Incorrect Auth');
  }
  const caCert = pki.certificateFromPem(caCertPem);
  const key = pki.privateKeyFromPem(privKey);
  const keys = pki.rsa.generateKeyPair(2048);
  const cert = pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);
  cert.setIssuer(caCert.subject.attributes);
  cert.serialNumber = (new Date().getTime() / 1000).toString();
  const attrs = [{
    name: 'countryName',
    value: 'US',
  }, {
    shortName: 'ST',
    value: 'Washington',
  }, {
    name: 'localityName',
    value: 'Olympia',
  }, {
    name: 'organizationName',
    value: 'Alex Testing Inc',
  }, {
    shortName: 'OU',
    value: 'Alex CA',
  }];
  cert.setSubject(attrs);
  cert.sign(key, forge.md.sha256.create());
  const crt = pkcs12.toPkcs12Asn1(keys.privateKey, cert, '');
  const p12Der = forge.asn1.toDer(crt).getBytes();
  const p12b64 = forge.util.encode64(p12Der);
  return res.end(JSON.stringify({ crt: p12b64 }));
});
module.exports = router;
