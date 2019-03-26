"use strict";

// Packages
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

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
app.use(cookieParser());
app.use(session({secret: "Shh, its a secret!"}));

let players = [];

app.get("/", (req, res) => {
  if (players.length <= 2) {
    if (!players.includes(req.session.id)) {
      players.push(req.session.id);
    }
    res.redirect(`player/${players.indexOf(req.session.id)}?y=0`);
  }
})

app.get("/test", (req, res) => {

    // let tst = ;
    console.log("tst", players, players.indexOf(req.session.id))
  res.render("index.ejs", {id: players.indexOf(req.session.id)})
})

app.get("/player/:id", (req, res) => {
  let me = players.map((d, i) => {
    return {id: i, token: d, yPos: 0}
  })

  players = me;
  console.log("me", me)
  res.render("view.ejs", players[req.params.id])
})

app.post("/update", (req, res) => {

  let maxDistance = 10;
  let y = parseInt(req.body.y);
  console.log(y)
  if (req.body.direction == "up") {
    y -= 10
  } else {
    y += 10
  }
  console.log("new", y)


  // console.log(players)

  res.render("view.ejs", {id: req.body.id, token: req.body.token, yPos: y})
})

app.listen(port, () => console.log(`Listening on port: ${port}`))
