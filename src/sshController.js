const express = require('express');
const fs = require('fs');
const sshpk = require('sshpk');
const auth = require('./auth.js');

const router = express.Router();
const pubKey = sshpk.parseKey(fs.readFileSync(`${__dirname}/../keys/sshca_key.pub`, 'utf8'));
const privKey = sshpk.parsePrivateKey(fs.readFileSync(`${__dirname}/../keys/sshca_key`, 'utf8'));
const caCert = sshpk.parseCertificate(fs.readFileSync(`${__dirname}/../keys/alexCA.pem`, 'utf8'), 'pem');

router.post('/renewClient', (req, res) => {
  const certificate = sshpk.parseCertificate(req.body.crt, 'openssh');
  if (certificate.isExpired()) {
    return res.status(401).send('Expired Key');
  } if (!certificate.isSignedByKey(pubKey, privKey)) {
    return res.status(401).send('Incorrect Signing');
  }
  const options = { lifetime: 604800 };
  const newCrt = sshpk.createCertificate(
    certificate.subjects,
    certificate.subjectKey,
    certificate.issuer,
    privKey,
    options,
  );
  newCrt.signatures.openssh.exts = certificate.getExtensions();
  newCrt.signWith(privKey);
  return res.end(JSON.stringify({ crt: newCrt.toString('openssh') }));
});
router.post('/signHost', (req, res) => {
  if (!auth.authToken(req.header('api_key'))) {
    return res.status(401).send('Incorrect Auth');
  }
  const hostKey = sshpk.parseKey(req.body.pubkey);
  const hostName = req.body.hostname;
  const hostCert = sshpk.createCertificate(sshpk.identityForHost(`${hostName}.local`), hostKey, caCert.subjects[0], privKey);
  hostCert.signWith(privKey);
  return res.end(JSON.stringify({ crt: hostCert.toString('openssh') }));
});
module.exports = router;
