"use strict";

// Packages
const express = require("express");
const ejs = require("ejs");
const http = require("http");
const socketIO = require("socket.io");
const bodyParser = require("body-parser");

// Default variables
const port = 4000;
const app = express();
const server = http.Server(app);
const io = socketIO(server);

// App settings
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static("static"));
app.use(bodyParser.urlencoded({
  extended: true
}));

// Socket IO
// let players = {};

const maxRooms = 5;

function roomGen() {

  const rooms = [];

  for (let room = 0; room < maxRooms; room++) {
    rooms.push({
      id: room,
      href: `/room/${room}`,
      maxPlayers: 5
    })
  }
  return rooms
}

app.get("/lobby", (req, res) => {
  res.render("index.ejs", {
    rooms: roomGen()
  });
})

app.get("/room/:id", (req, res) => {
  if (parseInt(req.params.id) > maxRooms) {
    throw "Room doesn't exist";
  }

  const room = {
    id: req.params.id
  }
  res.render("room.ejs", {
    room: room
  })
})

io.on("connection", socket => {
  // Add new player to players object
  // players[socket.id] = ;

  updatePlayers();
  socket.send("HELLO", socket.id)
  // socket.emit("newPlayer", socket.id);

  // Remove disconnected player from players object
  socket.on("disconnect", () => {
    delete players[socket.id];

    updatePlayers();
  });
});

server.listen(port, () => console.log(`Listening to port: ${port}`));
