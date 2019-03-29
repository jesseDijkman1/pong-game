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

// const maxPlayers = 2;
const ballSpeed = 2.5 / 98; // Is the speed per 1%
const host = "localhost:4000"; // Might become heroku somthing
const padHeight = 15;
let readyPlayers = [];

let pads = {};
let ball;
let score = 0;
let missed = 0;

class Ball {
  constructor(x, y, single) {
    this.speed;
    this.single = single;
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

  randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
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
    // const randomBetween = (min, max) => ;

    if (randomBinary() === 1) {
      // Go to the top or bottom first

      // console.log("go to the top or bottom")
      const randomYDirection = randomBinary() ? 98 : 0; // Bottom / Top
      const randomXDirection = this.single ? 1 : randomBinary();
      // console.log("100 = bottom, 0 = top", randomYDirection)
      this.end.y = randomYDirection;

      if (randomXDirection === 1) {
        // Go to right
        // console.log("go the right")
        this.end.x = this.randomBetween(75, 90)
      } else {
        // Go to left
        // console.log("go the left")
        this.end.x = this.randomBetween(10, 25)
      }

    } else {

      // console.log("go to the left or right")

      const randomXDirection = this.single ? 98 : randomBinary() ? 98 : 0; // right / left
      const randomYDirection = randomBinary();
      // console.log("100 = right, 0 = left", randomYDirection)
      this.end.x = randomXDirection;

      if (randomYDirection === 1) {
        // Go to bottom
        // console.log("go to bottom")
        this.end.y = this.randomBetween(75, 90)
      } else {
        // Go to top
        // console.log("go to top")
        this.end.y = this.randomBetween(25, 40)
      }
      // Go to the sides first
    }
    })
  }

  update() {
    let xDirection;
    let yDirection;



    if (this.start.y > this.end.y) {
      yDirection = "up"
    } else {
      yDirection = "down"
    }

    if (this.start.x > this.end.x) {
      xDirection = "left"
    } else {
      xDirection = "right"
    }

    console.log(xDirection, yDirection)

    if (this.end.y === 0) {
      // TOP
      this.start.y = 0;
      this.start.x = this.end.x;
      this.end.y = this.randomBetween(10, 90)

      if (xDirection == "left") {
        this.end.x = 0;
      } else {
        this.end.x = 98;
      }

    } else if (this.end.y === 98) {
      // BOTTOM
      this.start.y = 98;
      this.start.x = this.end.x;
      this.end.y = this.randomBetween(10, 90);

      if (xDirection == "left") {
        this.end.x = 0;
      } else {
        this.end.x = 98;
      }

    } else if (this.end.x === 0) {
      // LEFT
      this.start.x = 0;
      this.start.y = this.end.y;
      this.end.x = this.randomBetween(10, 90);

      if (yDirection == "up") {
        this.end.y = 0
      } else {
        this.end.y = 98
      }

    } else if (this.end.x === 98) {
      // RIGHT
      this.start.x = 98;
      this.start.y = this.end.y;
      this.end.x = this.randomBetween(10, 90);

      if (yDirection == "up") {
        this.end.y = 0
      } else {
        this.end.y = 98
      }
    }

    this.calcDistances()
    this.calcSpeed()
  }

  checkPad(pad) {
    if (this.start.x === 0) {
      const padTop = pad.yPos;
      const padBottom = pad.yPos + padHeight;
      const ballY = this.start.y;

      if (ballY >= padTop && ballY <= padBottom) {
        console.log("was on pad")
        switch (score) {
          case 5:
          this.speed = 2 / 98
          break;
          case 10:
          this.speed = 1.5 / 98
          break;
          case 15:
          this.speed = 1 / 98
          break;
        }

        console.log(this.speed)
        score++;
      } else {
        missed++;
        console.log("missed")
      }
    }
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
  ball = new Ball(50, 50, false)

  res.render("game.ejs", {
    host: host,
    singlePlayer: false
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

app.get("/gameStart/single", (req, res) => {
  const player = req.session.id;

  ball = new Ball(50, 50, true)

  pads[player] = {
    yPos: 0
  }

  res.render("game.ejs", {
    host: host,
    singlePlayer: true
  })
})



app.get("/pad", (req, res) => {
  const thisSession = req.session.id;
  const single = req.query.single || false;

  // const enemy = (player != thisSession) ? true : false;
  if (single) {
    res.render("singlePad.ejs", {pads: pads, padHeight: padHeight, thisSession: thisSession})
  } else {
    res.render("pads.ejs", {
      sessions: readyPlayers,
      thisSession: thisSession,
      padHeight: padHeight,
      pads: pads
    })
  }
})

app.post("/pad/update", (req, res) => {
  const direction = req.body.direction;
  const thisSession = req.session.id;
  const single = req.query.single || false;

  if (direction === "up") {
    pads[thisSession].yPos -= 10
  } else {
    pads[thisSession].yPos += 10
  }

  if (single) {
    console.log(padHeight)
    res.render("singlePad.ejs", {pads: pads, padHeight: padHeight, thisSession: thisSession})
  } else {
    res.render("pads.ejs", {
      sessions: readyPlayers,
      thisSession: thisSession,
      padHeight: padHeight,
      pads: pads
    })
  }
})



app.get("/ball", (req, res) => {
  const single = req.query.single || false;

  res.render("ball.ejs", {
    ball: ball,
    host: host,
    single: single,
    score: score,
    missed: missed
  })
})

app.get("/updateBall", (req, res) => {
  const player = req.session.id;
  const single = req.query.single || false;
  ball.update()

  if (single) {
    ball.checkPad(pads[player])
  }

  // await changeDirection();
  // console.log(ball)
  // res.redirect("/ball");
  res.render("ball.ejs", {
    ball: ball,
    host: host,
    single: single,
    score: score,
    missed: missed
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
