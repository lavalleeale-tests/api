const express = require('express');
var online = 0
var allClients = [];
module.exports = function (app, server) {

    var io = require('socket.io')(server, {
        cors: {
            origin: "https://lavalleeale.github.io",
            methods: ["GET", "POST"]
        },
        path: '/chatApp/socket'
    })

    io.on('connection', socket => {
        socket.on('sendMessage', (data) => {
            console.log(`Got message: ${data}`)
            io.emit("update", data)
        });
        socket.on('newUser', (data) => {
            online++
            allClients[socket] = data
            console.log(`${data} has joined`)
            socket.emit("users", JSON.stringify(Object.values(allClients)))
            io.emit("newUser", data)
        });
        socket.on('disconnect', () => {
            online--
            console.log(`${allClients[socket]} has left`)
            io.emit("delUser", allClients[socket])
            delete (allClients[socket])
        });
        socket.on('changeName', (data) => {
            parsedData = JSON.parse(data)
            console.log(`${parsedData.oldName} has changed their name to ${parsedData.newName}`)
            allClients[socket] = parsedData.newName
            io.emit("changeName", data)
        });
    });
}
