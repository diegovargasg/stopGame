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
    const gameId = _.get(data, "gameId", "");
    const name = _.get(data, "name", "");
    const categories = _.get(data, "categories", []);
    const letters = _.get(data, "letters", []);
    const ready = false;
    const socketId = socket.id;
    //update list of players of that game id
    addUser({ socketId, gameId, name, ready });

    if (_.isEmpty(categories) || _.isEmpty(letters)) {
      //Is a joiner and needs the categories
      console.log("gameData", gameId, getGameDataById(gameId));
      socket.emit("gameData", getGameDataById(gameId));
    } else {
      //Is the creator, store the game gategories and letters
      addGame({ gameId, categories, letters });
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

    /*storeGameIdWords({
      socketId,
      gameId,
      letter: data.letter,
      words: data.words,
    });*/

    socket.broadcast.to(gameId).emit("otherUserWords", data);
    //io.to(gameId).emit("allUsers", getAllUsersByGameId(gameId));
  });
});

//Runs server
server.listen(port, () => {
  console.log(`Server running in ${port}`);
});
