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
  updateGameById,
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
  try {
    const id = socket.id;
    const user = await getUser(id);
    const gameId = _.get(user, "gameId", "");
    return { id, user, gameId };
  } catch (error) {
    return error;
  }
};

//Run when client connects
io.on("connection", (socket) => {
  //User has joined a game
  socket.on("joinGame", async (data) => {
    const gameId = _.get(data, "id", "");
    const name = _.capitalize(_.get(data, "name", ""));
    const categories = _.get(data, "categories", []);
    const letters = _.get(data, "letters", []);
    const rounds = _.get(data, "rounds", 0);
    const ready = false;
    const id = socket.id;

    try {
      //update list of players of that game id
      await addUser({ id, gameId, name, ready });
      if (_.isEmpty(categories) || _.isEmpty(letters) || rounds === 0) {
        //Is a joiner and needs the categories
        const gameData = await getGameDataById(gameId);
        socket.emit("gameData", gameData);
      } else {
        //Is the creator, store the game gategories and letters
        await addGame({ id: gameId, categories, letters, rounds });
      }

      socket.join(gameId);
      const allUsersByGameId = await getAllUsersByGameId(gameId);
      io.to(gameId).emit("allUsers", allUsersByGameId);
    } catch (error) {
      return error;
    }
  });

  socket.on("cleanGame", async (gameId) => {
    try {
      await removeAllUsersByGameId(gameId);
      await removeGameById(gameId);
    } catch (error) {
      return error;
    }
  });

  socket.on("disconnect", async () => {
    try {
      const mainData = await getMainData(socket);
      await removeUser(mainData.id);
      await updateAllUsersByGameId({ gameId: mainData.gameId, ready: false });

      const allUsersByGameId = await getAllUsersByGameId(mainData.gameId);
      io.to(mainData.gameId).emit("allUsers", allUsersByGameId);

      //All the users left, clean up in case the game has already started
      const gameData = getGameDataById(mainData.gameId);
      if (_.size(allUsersByGameId) <= 1 && gameData.started) {
        //Emit message to disconnect all possible remaining users
        await removeAllUsersByGameId(mainData.gameId);
        io.to(mainData.gameId).emit("fatalError", "All your opponents left");
      } else if (_.size(allUsersByGameId) === 0) {
        await removeGameById(mainData.gameId);
      }
    } catch (error) {
      return error;
    }
  });

  //user is ready
  socket.on("userReady", async (ready) => {
    try {
      const mainData = await getMainData(socket);

      await updateUser(mainData.id, ready);
      const allUsersByGameId = await getAllUsersByGameId(mainData.gameId);

      io.to(mainData.gameId).emit("allUsers", allUsersByGameId);

      const areAllUsersReady = await allUsersReady(mainData.gameId);
      if (areAllUsersReady) {
        await updateGameById(mainData.gameId, true);
        io.to(mainData.gameId).emit("startGame", true);
      }
    } catch (error) {
      return error;
    }
  });

  //User finished all words
  socket.on("userFinished", async (data) => {
    try {
      const mainData = await getMainData(socket);
      io.to(mainData.gameId).emit("gameEnded", mainData.id);
    } catch (error) {
      return error;
    }
  });

  //Sent all the users answers
  socket.on("userWords", async (data) => {
    try {
      const mainData = await getMainData(socket);
      socket.broadcast.to(mainData.gameId).emit("otherUserWords", data);
    } catch (error) {
      return error;
    }
  });

  socket.on("userVotes", async (data) => {
    try {
      const mainData = await getMainData(socket);
      socket.broadcast.to(mainData.gameId).emit("otherUserVoted", data);
    } catch (error) {
      return error;
    }
  });

  socket.on("moderationEnded", async (data) => {
    try {
      const mainData = await getMainData(socket);
      io.to(mainData.gameId).emit("moderationEnded", data);
    } catch (error) {
      return error;
    }
  });

  socket.on("resultsContinue", async (data) => {
    try {
      const mainData = await getMainData(socket);
      io.to(mainData.gameId).emit("resultsContinue", data);
    } catch (error) {
      return error;
    }
  });
});

//Runs server
server.listen(port, () => {
  console.log(`Server running in ${port}`);
});
