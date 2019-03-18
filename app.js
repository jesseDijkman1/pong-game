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

function updatePlayerOrder() {
  let allKeys = Object.keys(players);

  for (let player in players) {
    let index = allKeys.indexOf(player);

    players[player].currentOrder = index;
  }
}

io.on("connection", socket => {
  // Add new player to players object
  players[socket.id] = {};

  updatePlayerOrder();

  console.log(players)
  socket.emit("newPlayer", socket.id);

  // Give player name
  socket.on("playerName", playerData => players[playerData.playerId].name = playerData.playerName);

  // Remove disconnected player from players object
  socket.on("disconnect", () => {
    delete players[socket.id];

    console.log("Deleted")

    updatePlayerOrder();
  });
});

server.listen(port, () => console.log(`Listening to port: ${port}`));
