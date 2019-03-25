"use strict";

// Packages
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
// const session = require("express-session");

// Default variables
const port = 4000;
const app = express();

// App settings
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static("static"));
app.use(bodyParser.urlencoded({
  extended: true
}));
// app.use(cookieParser());
// app.use(session({secret: "Shh, its a secret!"}));

let players = [];
let foo;

app.get("/", (req, res) => {
  foo = {
    player_1: null,
    player_2: null
  }

  res.redirect("/lobby")
})

app.get("/lobby", (req, res) => {
  res.render("index.ejs", foo)
})

app.post("/pickPlayer", (req, res) => {
  const nr = req.body.player;
  foo[`player_${nr}`] = true;

  res.redirect("/lobby")
})

app.get("/player/:id", (req, res) => {

})

app.get("/waiting", (req, res) => {

})

app.listen(port, () => console.log(`Listening on port: ${port}`))
