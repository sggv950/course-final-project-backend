"use strict";

const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const history = require('connect-history-api-fallback');
var http = require("http").Server(app);
const io = require("socket.io").listen(http);
const eventRoute = require("./routes/event.route");
const playerRoute = require("./routes/player.route");

app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  session({
    secret: "puki muki",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  })
);

eventRoute(app);
playerRoute(app);

app.use(history());
app.use(express.static("public"));

io.on("connection", socket => {
  socket.on("chatJoined", room => socket.join(room));
  
  socket.on("assignMsg", ({ msg, room }) => {
    io.sockets.in(room).emit("renderMsg", msg);
  });
  
  
  // socket.on("assignMsg", ({ msg, room }) => {
  //   io.sockets.in(room).emit("renderMsg", msg);
  // });
});

http.listen(process.env.PORT || 3000, () => {
  console.log('server running')
});

