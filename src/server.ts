const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

const users = {};

io.on('connection', socket => {
    if (!users[socket.id]) {
        users[socket.id] = socket.id;
    }

    socket.emit("init", socket.id);

    io.sockets.emit("usersOnline", users);

    socket.on('disconnect', () => {
        delete users[socket.id];
    });

    socket.on("callUser", (data) => {
        io.to(data.userToCall).emit('callRequest', {signal: data.signalData, from: data.from});
    })

    socket.on("acceptCall", (data) => {
        io.to(data.to).emit('callAccepted', data.signal);
    })
});

server.listen(8000, () => console.log('server is running on port 8000'));