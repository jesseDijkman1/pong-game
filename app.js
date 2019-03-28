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
const ballSpeed = 3 / 100; // Is the speed per 1%
const host = "localhost:4000"; // Might become heroku somthing

let readyPlayers = [];
let pads = {};
let ball;


class Ball {
  constructor(x, y) {
    this.speed;
    this.yDistance;
    this.xDistance;

    this.start = {
      x: x,
      y: y
    }
    this.end = {
      x: undefined,
      y: undefined
    }

    this.startDirection()
    this.calcDistances()
    this.calcSpeed()
  }

  calcDistances() {
    this.yDistance = Math.abs(this.start.y - this.end.y)
    this.xDistance = Math.abs(this.start.x - this.end.x)
  }

  calcSpeed() {
    const distance = Math.sqrt((this.yDistance * this.yDistance) + (this.xDistance * this.xDistance));

    this.speed = ballSpeed * distance;
  }

  startDirection() {
    return new Promise((resolve, reject) => {


    const randomBinary = () => Math.round(Math.random()); // 1 or 0
    const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

    if (randomBinary() === 1) {
      // Go to the top or bottom first

      console.log("go to the top or bottom")
      const randomYDirection = randomBinary() ? 100 : 0; // Bottom / Top
      const randomXDirection = randomBinary();
      console.log("100 = bottom, 0 = top", randomYDirection)
      this.end.y = randomYDirection;

      if (randomXDirection === 1) {
        // Go to right
        console.log("go the right")
        this.end.x = randomBetween(75, 90)
      } else {
        // Go to left
        console.log("go the left")
        this.end.x = randomBetween(10, 25)
      }

    } else {

      console.log("go to the left or right")
      const randomXDirection = randomBinary() ? 100 : 0; // right / left
      const randomYDirection = randomBinary();
      console.log("100 = right, 0 = left", randomYDirection)
      this.end.x = randomXDirection;

      if (randomYDirection === 1) {
        // Go to bottom
        console.log("go to bottom")
        this.end.y = randomBetween(50, 90)
      } else {
        // Go to top
        console.log("go to top")
        this.end.y = randomBetween(10, 50)
      }
      // Go to the sides first
    }
    })
  }

}







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
  ball = new Ball(50, 50)
  console.log(ball)
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



app.get("/ball", (req, res) => {
  res.render("ball.ejs", {ball: ball, host: host})
})

app.get("/updateBall", async (req, res) => {
  // ball.update()
  // await changeDirection();
  // console.log(ball)
  // res.redirect("/ball");
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
