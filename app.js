"use strict";

// Packages
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");


// Default variables
const port = 4000;
const app = express();
const server = http.Server(app);
const io = socketIO(server);

// App settings
app.use(express.static("static"));

// App routing
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Socket IO
let players = {};

io.on('connection', socket => {
  // Add new player to players object
  players[socket.id] = {};

  // Remove player that left from players object
  socket.on('disconnect', () => delete players[socket.id]);
});

server.listen(port, () => console.log(`Listening to port: ${port}`));
