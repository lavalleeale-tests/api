const uuidv4 = require('uuid').v4;

const express = require('express');
const passwordHash = require('password-hash');
const fs = require('fs');

let users = JSON.parse(fs.readFileSync(`${__dirname}/../notesApp/users.json`, 'utf8'));

fs.watch(`${__dirname}/../notesApp/users.json`, (event, filename) => {
  if (filename) {
    users = JSON.parse(fs.readFileSync(`${__dirname}/../notesApp/users.json`, 'utf8'));
  }
});

function getNotes(uuid) {
  let notes = -1;
  Object.keys(users).forEach((user) => {
    users[user].uuids.forEach((useruuid) => {
      if (useruuid === uuid) {
        notes = users[user].notes;
      }
    });
  });
  return notes;
}
function validUUID(uuid) {
  let found = false;
  Object.keys(users).forEach((user) => {
    users[user].uuids.forEach((useruuid) => {
      if (useruuid === uuid) {
        found = true;
      }
    });
  });
  return found;
}
function getName(uuid) {
  let found = -1;
  Object.keys(users).forEach((user) => {
    users[user].uuids.forEach((useruuid) => {
      if (useruuid === uuid) {
        found = user;
      }
    });
  });
  return found;
}
function getNote(user, id) {
  let found = -1;
  users[user].notes.forEach((note, index) => {
    if (note.id === id) {
      found = index;
    }
  });
  return found;
}

const router = express.Router();
router.post('/auth', (req, res, next) => {
  if (users[req.body.username]) {
    if (passwordHash.verify(req.body.password, users[req.body.username].password)) {
      const uuid = uuidv4();
      res.cookie('uuid', uuid, {
        maxAge: 900000,
        httpOnly: true,
        domain: 'lavalleeale.github.io',
      });
      res.cookie('auth', true, {
        maxAge: 900000,
        domain: 'lavalleeale.github.io',
      });
      users[req.body.username].uuids.push(uuid);
      fs.writeFileSync(`${__dirname}/../notesApp/users.json`, JSON.stringify(users));
      next();
      return res.status(200).end();
    }
  }
  return res.status(401).end();
});
router.get('/getNotes', (req, res) => {
  if (validUUID(req.cookies.uuid)) {
    res.status(200).end(JSON.stringify(getNotes(req.cookies.uuid)));
  }
});
router.post('/addNote', (req, res) => {
  if (validUUID(req.cookies.uuid)) {
    users[getName(req.cookies.uuid)].notes.push({
      id: uuidv4(),
      name: req.body.name,
      content: req.body.content,
    });
    fs.writeFileSync(`${__dirname}/../notesApp/users.json`, JSON.stringify(users));
    return res.status(200).end(JSON.stringify(users[getName(req.cookies.uuid)].notes));
  }
  return res.status(401).end();
});
router.delete('/deleteNote', (req, res) => {
  if (validUUID(req.cookies.uuid)) {
    const name = getName(req.cookies.uuid);
    console.log(getNote(name, req.header('id')));
    users[name].notes.splice(getNote(name, req.header('id')), 1);
    fs.writeFileSync(`${__dirname}/../notesApp/users.json`, JSON.stringify(users));
    return res.status(200).end(JSON.stringify(users[name].notes));
  }
  return res.status(401).end();
});
module.exports = router;
