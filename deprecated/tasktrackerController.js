const express = require('express');
var cors = require('cors')

var corsOptions = {
  origin: 'https://lavalleeale.github.io',
  optionsSuccessStatus: 200
}

app.use(cors())

module.exports = function (app, server) {

  app.options('/taskTracker/*', cors())

  app.use("/taskTracker", express.static(__dirname + '/../' + 'taskTracker/public'));

  var io = require('socket.io')(server, {
    cors: {
      origin: "https://lavalleeale.github.io",
      methods: ["GET", "POST"]
    },
    path: '/taskTracker/socket'
  })
  function authenticate(username, password) {
    data = JSON.parse(fs.readFileSync(__dirname + "/../" + "users.json", 'utf8'));
    return verify(password, data[username])
  }
  app.get('/taskTracker/api/testAuth', cors(corsOptions), function (req, res) {
    auth = JSON.parse(req.header("auth"))
    if (!authenticate(auth["username"], auth["password"])) {
      return res.status(403).end()
    } else {
      return res.end()
    }
  });
  app.get('/taskTracker/api/:key', cors(corsOptions), function (req, res) {
    auth = JSON.parse(req.header("auth"))
    if (!authenticate(auth["username"], auth["password"])) {
      return res.status(403).end()
    }
    data = JSON.parse(fs.readFileSync(__dirname + "/../" + "db.json", 'utf8'));
    key = req.params.key
    return res.end(JSON.stringify(data[key]))
  });
  app.post('/taskTracker/api/:key', cors(corsOptions), function (req, res) {
    auth = JSON.parse(req.header("auth"))
    if (!authenticate(auth["username"], auth["password"])) {
      return res.status(403).end()
    }
    data = JSON.parse(fs.readFileSync(__dirname + "/../" + "db.json", 'utf8'));
    key = req.params.key
    if (!data[key]) {
      data[key] = []
    }
    body = req.body;
    id = uuidv4();
    body.id = id;
    data[key].push(body);
    fs.promises.writeFile(__dirname + "/../" + "db.json", JSON.stringify(data), () => { })
    io.emit("update", JSON.stringify(data[key]))
    return res.end(JSON.stringify(body));
  });
  app.put('/taskTracker/api/:key/:id', cors(corsOptions), function (req, res) {
    auth = JSON.parse(req.header("auth"))
    if (!authenticate(auth["username"], auth["password"])) {
      return res.status(403).end()
    }
    data = JSON.parse(fs.readFileSync(__dirname + "/../" + "db.json", 'utf8'));
    key = req.params.key
    id = req.params.id
    body = req.body;
    data[key].forEach(element => {
      if (element.id === id) {
        element = req.body;
        data[key].push(body)
        fs.promises.writeFile(__dirname + "/../" + "db.json", JSON.stringify(data), () => { })
        io.emit("update", JSON.stringify(data[key]))
        return res.end(JSON.stringify(req.body));
      }
    });

  });
  app.delete('/taskTracker/api/:key/:id', cors(corsOptions), function (req, res) {
    auth = JSON.parse(req.header("auth"))
    if (!authenticate(auth["username"], auth["password"])) {
      return res.status(403).end()
    }
    data = JSON.parse(fs.readFileSync(__dirname + "/../" + "db.json", 'utf8'));
    key = req.params.key
    id = req.params.id
    body = req.body;
    for (let i = 0; i < data[key].length; i++) {
      const element = data[key][i];
      if (element.id === id) {
        toPop = i
      }
      data[key].pop(i)
      console.log(data)
      fs.promises.writeFile(__dirname + "/../" + "db.json", JSON.stringify(data), () => { })
      io.emit("update", JSON.stringify(data[key]));
      return res.end();
      break;

    }

  });
}
