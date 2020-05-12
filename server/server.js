const express = require("express");
const _ = require("lodash");
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
  unReadyAllUsersByGameId,
} = require("./utils/users");

const { addGame, getGameDataById } = require("./utils/game");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, "../client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

//Run when client connects
io.on("connection", (socket) => {
  console.log(`user connected ${socket.id}`);
  //User has joined a game
  socket.on("joinGame", (data) => {
    const gameId = _.get(data, "id", "");
    const name = _.get(data, "name", "");
    const categories = _.get(data, "categories", []);
    const letters = _.get(data, "letters", []);
    const rounds = _.get(data, "rounds", 0);
    const ready = false;
    const socketId = socket.id;
    //update list of players of that game id
    addUser({ socketId, gameId, name, ready });

    if (_.isEmpty(categories) || _.isEmpty(letters) || rounds === 0) {
      //Is a joiner and needs the categories
      console.log("gameData sent to joiner", gameId, getGameDataById(gameId));
      socket.emit("gameData", getGameDataById(gameId));
    } else {
      //Is the creator, store the game gategories and letters
      console.log("game created", { gameId, categories, letters, rounds });
      addGame({ gameId, categories, letters, rounds });
    }

    socket.join(gameId);
    io.to(gameId).emit("allUsers", getAllUsersByGameId(gameId));
  });

  socket.on("disconnect", () => {
    const socketId = socket.id;
    const user = getUser(socketId);
    const gameId = _.get(user, "gameId", "");
    console.log(`user disconneted ${socketId}`);
    removeUser(socketId);
    unReadyAllUsersByGameId(gameId);

    io.to(gameId).emit("allUsers", getAllUsersByGameId(gameId));
  });

  //user is ready
  socket.on("userReady", (ready) => {
    console.log("user is ready");
    const socketId = socket.id;
    const userReady = getUser(socketId);
    const gameId = _.get(userReady, "gameId", "");

    updateUserReady(socketId, ready);

    io.to(gameId).emit("allUsers", getAllUsersByGameId(gameId));

    if (allUsersReady(gameId)) {
      io.to(gameId).emit("startGame", true);
    }
  });

  //User finished all words
  socket.on("userFinished", (data) => {
    const socketId = socket.id;
    const userReady = getUser(socketId);
    const gameId = _.get(userReady, "gameId", "");
    io.to(gameId).emit("gameEnded", socketId);
    console.log("User finished the game", socketId);
  });

  //Sent all the users answers
  socket.on("userWords", (data) => {
    const socketId = socket.id;
    const user = getUser(socketId);
    const gameId = _.get(user, "gameId", "");
    console.log("send to the rest of users", data);
    socket.broadcast.to(gameId).emit("otherUserWords", data);
  });

  socket.on("userVotes", (data) => {
    console.log("votes", data);
    const socketId = socket.id;
    const user = getUser(socketId);
    const gameId = _.get(user, "gameId", "");
    socket.broadcast.to(gameId).emit("otherUserVoted", data);
  });
});

//Runs server
server.listen(port, () => {
  console.log(`Server running in ${port}`);
});
