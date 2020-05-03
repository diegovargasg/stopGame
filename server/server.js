const express = require("express");
const port = process.env.PORT || "9000";
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const _ = require("lodash");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, "../client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

/*Users handling */
const allUsers = [];

//Run when client connects
io.on("connection", (socket) => {
  //User has joined a game
  socket.on("joinGame", (data) => {
    const gameId = _.get(data, "gameId", "");
    const name = _.get(data, "name", "");
    const ready = false;
    const socketId = socket.id;

    //update list of players of that game id
    allUsers.push({ socketId, gameId, name, ready });

    socket.join(gameId);

    io.to(gameId).emit(
      "allUsers",
      _.filter(allUsers, (user) => {
        return user.gameId === gameId;
      })
    );
  });

  socket.on("disconnect", () => {
    const socketId = socket.id;
    const userLeft = _.find(allUsers, (user) => {
      return user.socketId === socketId;
    });

    _.remove(allUsers, (user) => {
      return user.socketId === socketId;
    });

    const gameId = _.get(userLeft, "gameId", "");
    io.to(gameId).emit(
      "allUsers",
      _.filter(allUsers, (user) => {
        return user.gameId === gameId;
      })
    );
  });

  //user is ready
  socket.on("userReady", (data) => {
    console.log(data);
    const socketId = socket.id;
    const userReady = _.find(allUsers, (user) => {
      return user.socketId === socketId;
    });
    const userIndex = _.findIndex(allUsers, (user) => {
      return user.socketId === socketId;
    });
    const gameId = _.get(userReady, "gameId", "");
    console.log(allUsers);
    _.set(allUsers, `${userIndex}.ready`, data);
    console.log(allUsers);
    io.to(gameId).emit(
      "allUsers",
      _.filter(allUsers, (user) => {
        return user.gameId === gameId;
      })
    );
  });
});

//Runs server
server.listen(port, () => {
  console.log(`Server running in ${port}`);
});

function getUser(socketId) {
  return _.find(allUsers, (user) => {
    return user.socketId === socketId;
  });
}
