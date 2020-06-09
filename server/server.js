const express = require("express");
const _ = require("lodash");
const cors = require("cors");
const port = process.env.PORT || "5000";
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const {
  getUser,
  addUser,
  removeUser,
  getAllUsersByGameId,
  removeAllUsersByGameId,
  updateUser,
  allUsersReady,
  updateAllUsersByGameId,
} = require("./utils/users");

const {
  addGame,
  getGameDataById,
  removeGameById,
  startGameById,
} = require("./utils/games");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, "../client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

const getMainData = async (socket) => {
  const id = socket.id;
  const user = await getUser(id);
  const gameId = _.get(user, "gameId", "");
  return { id, user, gameId };
};

//Run when client connects
io.on("connection", (socket) => {
  console.log(`user connected ${socket.id}`);
  //User has joined a game
  socket.on("joinGame", async (data) => {
    const gameId = _.get(data, "id", "");
    const name = _.capitalize(_.get(data, "name", ""));
    const categories = _.get(data, "categories", []);
    const letters = _.get(data, "letters", []);
    const rounds = _.get(data, "rounds", 0);
    const ready = false;
    const points = {};
    const id = socket.id;

    //update list of players of that game id
    await addUser({ id, gameId, name, ready, points });

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
    const allUsersByGameId = await getAllUsersByGameId(gameId);
    io.to(gameId).emit("allUsers", allUsersByGameId);
  });

  socket.on("cleanGame", async (gameId) => {
    await removeAllUsersByGameId(gameId);
    removeGameById(gameId);
  });

  socket.on("disconnect", async () => {
    const mainData = await getMainData(socket);
    await removeUser(mainData.id);
    await updateAllUsersByGameId({ gameId: mainData.gameId, ready: false });

    const allUsersByGameId = await getAllUsersByGameId(mainData.gameId);
    console.log("allUsersByGameId", allUsersByGameId);
    io.to(mainData.gameId).emit("allUsers", allUsersByGameId);
    console.log(`user disconneted ${mainData.id}`);

    //All the users left, clean up in case the game has already started
    const gameData = getGameDataById(mainData.gameId);
    if (_.size(allUsersByGameId) <= 1 && gameData.started) {
      //Emit message to disconnect all possible remaining users
      io.to(mainData.gameId).emit("fatalError", "All your opponents left");
      await removeAllUsersByGameId(mainData.gameId);
      removeGameById(mainData.gameId);
    }
  });

  //user is ready
  socket.on("userReady", async (ready) => {
    const mainData = await getMainData(socket);

    await updateUser(mainData.id, ready);
    const allUsersByGameId = await getAllUsersByGameId(mainData.gameId);

    io.to(mainData.gameId).emit("allUsers", allUsersByGameId);

    console.log(`user is ready ${mainData.id}`);
    const areAllUsersReady = await allUsersReady(mainData.gameId);
    if (areAllUsersReady) {
      io.to(mainData.gameId).emit("startGame", true);
      startGameById(mainData.gameId);
      console.log("all users are ready");
    }
  });

  //User finished all words
  socket.on("userFinished", async (data) => {
    const mainData = await getMainData(socket);
    io.to(mainData.gameId).emit("gameEnded", mainData.id);
    console.log("User finished the game", mainData.id);
  });

  //Sent all the users answers
  socket.on("userWords", async (data) => {
    console.log("send to the rest of users", data);
    const mainData = await getMainData(socket);
    socket.broadcast.to(mainData.gameId).emit("otherUserWords", data);
  });

  socket.on("userVotes", async (data) => {
    console.log("votes", data);
    const mainData = await getMainData(socket);
    socket.broadcast.to(mainData.gameId).emit("otherUserVoted", data);
  });

  socket.on("moderationEnded", async (data) => {
    console.log("moderation Finished");
    const mainData = await getMainData(socket);
    io.to(mainData.gameId).emit("moderationEnded", data);
  });

  socket.on("resultsContinue", async (data) => {
    console.log("results ended");
    const mainData = await getMainData(socket);
    io.to(mainData.gameId).emit("resultsContinue", data);
  });
});

//Runs server
server.listen(port, () => {
  console.log(`Server running in ${port}`);
});
