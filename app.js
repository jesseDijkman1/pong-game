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

let players = [];

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
    console.log("Found myself in allsessions")
  }

})
app.listen(port, () => console.log(`Listening on port: ${port}`))
