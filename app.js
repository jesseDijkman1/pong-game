"use strict";

// Packages
const express = require("express");

// Default variables
const port = 5000;
const app = express();

// App settings
app.use(express.static("public"));

// App routing
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.listen(port, () => `Listening to port ${port}`);
