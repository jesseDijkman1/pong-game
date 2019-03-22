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
app.use(bodyParser.urlencoded({extended: true}));

class Pad {
  constructor(playerID) {
    this.player = playerID;
    this.padHeight =  `${80}px`;
    this.padWidth = `${30}px`;
    this.y = "0";
  }

  getData() {
    return {
      padHeight: this.padHeight,
      padWidth: this.padWidth,
      y: this.y
    }
  }
}


// Can change it to an array or generete keys
// let players = {
//   p1: undefined,
//   p2: undefined
// };

// something with the socketIO
// function temp() {
//   players.p1 = new Pad()
//   players.p2 = new Pad()
// }
// temp()


let players = [];

// App routing
app.get("/", (req, res) => {
  let ballX = parseInt(req.query.bx) || 50;
  let ballY = parseInt(req.query.by) || 50;
  let ballSize = parseInt(req.query.bSize);
  players.push(new Pad())
  players.push(new Pad())
  res.render("index.ejs", {padLeft: players[0], padRight: players[1], ballX: ballX, ballY: ballY, ballSize: ballSize})
});

app.get("/moveBall", (req, res) => {
  let moveDistance = 1;
  let ballSize = 5; // vw
  let ballX = parseInt(req.query.bx) + ballSize;
  let ballY = parseInt(req.query.by);

  res.redirect(`/?bx=${ballX}&by=${ballY}&bSize=${ballSize}`)
})

app.post("/updatePad", (req, res) => {
  let ballX = parseInt(req.query.bx) || 50;
  let ballY = parseInt(req.query.by) || 50;
  let ballSize = parseInt(req.query.bSize);
  const moveDistance = 50;
  const direction = req.body.direction;
  const pRightY = parseInt(req.body.pRightY);

  if (direction == "up") {
    players[1].y = parseInt(players[1].y) - moveDistance;
    res.render("index.ejs", {padLeft: players[0], padRight: players[1], ballX: ballX, ballY: ballY, ballSize: ballSize})
  } else {
    players[1].y = parseInt(players[1].y) + moveDistance;
    res.render("index.ejs", {padLeft: players[0], padRight: players[1], ballX: ballX, ballY: ballY, ballSize: ballSize})
  }
})

// Not sure if socket IO is the way to go, it looks like I will have to write client side javascript

// Socket IO
// let players = {};

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
