"use strict";

// Packages
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
// const sessionStore = new session.MemoryStore();
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
// app.use(cookieParser());
// app.use(session({store: sessionStore, secret: "mysecret"}));

const maxPlayers = 2;
const host = "localhost:4000"; // Might become heroku somthing
let readyPlayers = [];
let pads = {};

app.get("/", (req, res) => {
  console.log("in root")
  res.redirect("/lobby")
})

app.get("/lobby", (req, res) => {
  console.log("in lobby")
  const allSessions = Object.keys(req.sessionStore.sessions);

  if (!allSessions.includes(req.session.id)) {
    console.log("All sessions is empty")
    res.redirect("/")
  } else {
    if (allSessions.length === maxPlayers) {
      res.render("lobby.ejs", {
        host: host,
        players: allSessions,
        thisSession: req.session.id,
        ready: readyPlayers
      })
    } else {
      res.render("waiting.ejs", {
        host: host,
        players: allSessions
      })
    }
  }
})

app.get("/ready", async (req, res) => {
  const allSessions = Object.keys(req.sessionStore.sessions);
  const player = req.session.id;

  if (!readyPlayers.includes(player)) {
    readyPlayers.push(player)
    pads[player] = {
      yPos: 0
    }
  }

  try {
    await allReady(allSessions);

    res.redirect("/gameStart")
  } catch (e) {
    console.log(e, "not ready")

    res.render("lobby.ejs", {
      host: host,
      players: allSessions,
      thisSession: player,
      ready: readyPlayers
    })
  }
})

app.get("/gameStart", (req, res) => {
  res.render("game.ejs", {
    host: host
  })
  // const thisSession = req.session.id;
  // console.log(thisSession)
  // // const enemy = (player != thisSession) ? true : false;
  //
  // res.render("pads.ejs", {
  //   sessions: readyPlayers,
  //   thisSession: thisSession,
  //   pads: pads
  // })
})

app.get("/pad", (req, res) => {
  const thisSession = req.session.id;
  console.log(thisSession)
  // const enemy = (player != thisSession) ? true : false;

  res.render("pads.ejs", {
    sessions: readyPlayers,
    thisSession: thisSession,
    pads: pads
  })
})

app.post("/pad/update", (req, res) => {
  const direction = req.body.direction;
  const player = req.session.id;

  if (direction === "up") {
    pads[player].yPos -= 10
  } else {
    pads[player].yPos += 10
  }

  res.render("pads.ejs", {
    sessions: readyPlayers,
    thisSession: player,
    pads: pads
  })
})

function allReady(sessions) {
  return new Promise((resolve, reject) => {
    sessions.forEach(s => {
      if (!readyPlayers.includes(s)) {
        reject(s)
      }
    })
    resolve()
  })
}

app.listen(port, () => console.log(`Listening on port: ${port}`))
