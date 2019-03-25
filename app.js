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

app.get("/", (req, res) => {
  res.render("index.ejs")
})


// Socket IO

const players = {};

io.on("connection", socket => {
  players[socket.id] = {};
  
  socket.on("disconnect", () => delete players[socket.id]);
});

server.listen(port, () => console.log(`Listening to port: ${port}`));
