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

  io.on('connection', (socket) => {
    socket.on('sendMessage', (data) => {
      if (data.split(' ')[1].replace('\n', '') === '/w') {
        if (data.split(' ').length < 4) {
          return io.to(socket.id).emit('update', 'Incorrect Argument Count\n');
        }
        const userTo = Object.keys(allClients).find((key) => allClients[key] === data.split(' ')[2]);
        if (!userTo) {
          return io.to(socket.id).emit('update', `User ${data.split(' ')[2].replace('\n', '')} not found, maybe a spelling mistake?\n`);
        }
        const userFrom = allClients[socket.id];
        io.to(userTo).emit('update', `Whisper from ${userFrom}: ${data.split(' ').slice(3).join(' ')}`);
        return io.to(socket.id).emit('update', `Whisper to ${allClients[userTo]}: ${data.split(' ').slice(3).join(' ')}`);
      }
      console.log(`Got message: ${data}`);
      return io.to(Array.from(socket.rooms)[1]).emit('update', data);
    });
    socket.on('newUser', (data) => {
      const parsedData = JSON.parse(data);
      allClients[socket.id] = parsedData.username;
      console.log(`${parsedData.username} has joined with room ${parsedData.room}`);
      socket.join(parsedData.room);
      io.to(Array.from(socket.rooms)[1]).emit('newUser', parsedData.username);
    });
    socket.on('disconnect', () => {
      console.log(`${allClients[socket.id]} has left`);
      io.to(Array.from(socket.rooms)[1]).emit('delUser', allClients[socket.id]);
      delete (allClients[socket.id]);
    });
    socket.on('changeName', (data) => {
      const parsedData = JSON.parse(data);
      console.log(`${parsedData.oldName} has changed their name to ${parsedData.newName}`);
      allClients[socket.id] = parsedData.newName;
      io.to(Array.from(socket.rooms)[1]).emit('changeName', data);
    });
    socket.on('changeRoom', (data) => {
      console.log(`${allClients[socket.id]} has changed their room to ${data}`);
      io.to(Array.from(socket.rooms)[1]).emit('delUser', allClients[socket.id]);
      socket.leave(Array.from(socket.rooms)[1]);
      socket.join(data);
      io.to(Array.from(socket.rooms)[1]).emit('newUser', allClients[socket.id]);
    });
    socket.on('changeInfo', (data) => {
      const parsedData = JSON.parse(data);
      console.log(`${allClients[socket.id]} has changed their room to ${parsedData.room} and name to ${parsedData.username}`);
      io.to(Array.from(socket.rooms)[1]).emit('delUser', allClients[socket.id]);
      socket.leave(Array.from(socket.rooms)[1]);
      socket.join(parsedData.room);
      allClients[socket.id] = parsedData.username;
      io.to(Array.from(socket.rooms)[1]).emit('newUser', allClients[socket.id]);
    });
  });
};
