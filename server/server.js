const express = require("express");
const port = process.env.PORT || "9000";
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const {
  getUser,
  addUser,
  removeUser,
  getAllUsersByGameId,
  updateUserReady,
  allUsersReady,
} = require("./utils/users");
const _ = require("lodash");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, "../client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

//Run when client connects
io.on("connection", (socket) => {
  //User has joined a game
  socket.on("joinGame", (data) => {
    const gameId = _.get(data, "gameId", "");
    const name = _.get(data, "name", "");
    const ready = false;
    const socketId = socket.id;

    //update list of players of that game id
    addUser({ socketId, gameId, name, ready });

    socket.join(gameId);

    io.to(gameId).emit("allUsers", getAllUsersByGameId(gameId));
  });

  socket.on("disconnect", () => {
    const socketId = socket.id;
    const user = getUser(socketId);
    const gameId = _.get(user, "gameId", "");

    removeUser(socket);

    io.to(gameId).emit("allUsers", getAllUsersByGameId(gameId));
  });

  //user is ready
  socket.on("userReady", (ready) => {
    const socketId = socket.id;
    const userReady = getUser(socketId);
    const gameId = _.get(userReady, "gameId", "");

    updateUserReady(socketId, ready);

    io.to(gameId).emit("allUsers", getAllUsersByGameId(gameId));

    if (allUsersReady(gameId)) {
      io.to(gameId).emit("startGame", true);
    }
  });
});

//Runs server
server.listen(port, () => {
  console.log(`Server running in ${port}`);
});
