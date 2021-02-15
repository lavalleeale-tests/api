/* eslint-disable no-console */
const socketio = require('socket.io');

const allClients = [];
module.exports = (app, server) => {
  const io = socketio(server, {
    cors: {
      origin: 'https://lavalleeale.github.io',
      methods: ['GET', 'POST'],
    },
    path: '/chatApp/socket',
  });

  app.use('/chatApp', express.static(`${__dirname}/../chatApp/build`));

  function sendServerInfo() {
    const serverInfo = Object.values(allClients);
    return JSON.stringify(serverInfo);
  }

  io.on('connection', (socket) => {
    socket.emit('serverInfo', sendServerInfo());
    socket.on('sendMessage', (data) => {
      if (data.split(' ')[1].replace('\n', '') === '/w') {
        if (data.split(' ').length < 4) {
          return io.to(socket.id).emit('update', 'Incorrect Argument Count\n');
        }
        const userTo = Object.keys(allClients).find((key) => allClients[key].username.toLowerCase() === data.split(' ')[2].toLowerCase());
        if (!userTo) {
          return io.to(socket.id).emit('update', `User ${data.split(' ')[2].replace('\n', '')} not found, maybe a spelling mistake?\n`);
        }
        const userFrom = allClients[socket.id].username;
        io.to(userTo).emit('update', `Whisper from ${userFrom}: ${data.split(' ').slice(3).join(' ')}`);
        return io.to(socket.id).emit('update', `Whisper to ${allClients[userTo].username}: ${data.split(' ').slice(3).join(' ')}`);
      }
      console.log(`Got message: ${data}`);
      return io.to(Array.from(socket.rooms)[1]).emit('update', data);
    });
    socket.on('newUser', (data) => {
      const parsedData = JSON.parse(data);
      Object.values(allClients).forEach((client) => {
        if (client.username.toLowerCase() === parsedData.username.toLowerCase()) {
          return socket.disconnect();
        }
        return true;
      });
      allClients[socket.id] = parsedData;
      console.log(`${parsedData.username} has joined with room ${parsedData.room}`);
      socket.join(parsedData.room);
      io.to(Array.from(socket.rooms)[1]).emit('newUser', parsedData.username);
      return io.emit('serverInfo', sendServerInfo());
    });
    socket.on('disconnecting', () => {
      if (allClients[socket.id]) {
        console.log(`${allClients[socket.id].username} has left`);
        io.to(Array.from(socket.rooms)[1]).emit('delUser', allClients[socket.id].username);
        delete (allClients[socket.id]);
      }
      return io.emit('serverInfo', sendServerInfo());
    });
    socket.on('changeName', (data) => {
      const parsedData = JSON.parse(data);
      Object.values(allClients).forEach((client) => {
        if (client.username.toLowerCase() === parsedData.username.toLowerCase()) {
          return socket.disconnect();
        }
        return true;
      });
      console.log(`${parsedData.oldName} has changed their name to ${parsedData.newName}`);
      allClients[socket.id].username = parsedData.newName;
      io.to(Array.from(socket.rooms)[1]).emit('changeName', data);
      return io.emit('serverInfo', sendServerInfo());
    });
    socket.on('changeRoom', (data) => {
      console.log(`${allClients[socket.id].username} has changed their room to ${data}`);
      io.to(Array.from(socket.rooms)[1]).emit('delUser', allClients[socket.id].username);
      socket.leave(Array.from(socket.rooms)[1]);
      socket.join(data);
      io.to(Array.from(socket.rooms)[1]).emit('newUser', allClients[socket.id].username);
      return io.emit('serverInfo', sendServerInfo());
    });
    socket.on('changeInfo', (data) => {
      const parsedData = JSON.parse(data);
      Object.values(allClients).forEach((client) => {
        if (client.username.toLowerCase() === parsedData.username.toLowerCase()) {
          return socket.disconnect();
        }
        return true;
      });
      console.log(`${allClients[socket.id].username} has changed their room to ${parsedData.room} and name to ${parsedData.username}`);
      io.to(Array.from(socket.rooms)[1]).emit('delUser', allClients[socket.id]);
      socket.leave(Array.from(socket.rooms)[1]);
      socket.join(parsedData.room);
      allClients[socket.id] = parsedData;
      io.to(Array.from(socket.rooms)[1]).emit('newUser', allClients[socket.id].username);
      return io.emit('serverInfo', sendServerInfo());
    });
  });
};
