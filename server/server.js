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
  deleteAllPlayers,
} = require("./utils/users");

const {
  addGame,
  getGameDataById,
  removeGameById,
  updateGameById,
  deleteAllGames,
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

const destroyGameAndPlayers = async (gameId) => {
  try {
    Promise.all([removeAllUsersByGameId(gameId), removeGameById(gameId)]);
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
      const response = await addUser({ id, gameId, name, ready });
      socket.join(gameId);

      //If the user was not created
      if (response.status !== 201) {
        throw "problem creating the player";
      }

      if (_.isEmpty(categories) || _.isEmpty(letters) || rounds === 0) {
        //Is a joiner and needs the categories
        const gameData = await getGameDataById(gameId);
        socket.emit("gameData", gameData);
      } else {
        //Is the creator, store the game gategories and letters
        await addGame({ id: gameId, categories, letters, rounds });
      }

      const allUsersByGameId = await getAllUsersByGameId(gameId);
      io.to(gameId).emit("allUsers", allUsersByGameId);
    } catch (error) {
      return error;
    }
  });

  //used when the game finished
  socket.on("cleanGame", async (gameId) => {
    try {
      await destroyGameUsers(gameId);
    } catch (error) {
      return error;
    }
  });

  socket.on("disconnect", async () => {
    try {
      const mainData = await getMainData(socket);

      await Promise.all([
        removeUser(mainData.id),
        updateAllUsersByGameId({ gameId: mainData.gameId, ready: false }),
      ]);

      const [allUsersByGameId, gameData] = await Promise.all([
        getAllUsersByGameId(mainData.gameId),
        getGameDataById(mainData.gameId),
      ]);

      if (_.size(allUsersByGameId) > 1) {
        //someone left and the game hasn't started
        io.to(mainData.gameId).emit("allUsers", allUsersByGameId);
      } else if (_.size(allUsersByGameId) <= 1 && gameData.started) {
        //everyone left and the game has already started
        await destroyGameAndPlayers(mainData.gameId);
        io.to(mainData.gameId).emit("fatalError", "All your opponents left");
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  });

  //user is ready
  socket.on("userReady", async (ready) => {
    try {
      const mainData = await getMainData(socket);

      const response = await updateUser(mainData.id, ready);
      if (response.status !== 201) {
        console.log(response);
        throw "player update failed";
      }

      const allUsersByGameId = await getAllUsersByGameId(mainData.gameId);
      const areAllUsersReady = allUsersReady(allUsersByGameId);

      if (areAllUsersReady) {
        await updateGameById(mainData.gameId, true);
        io.to(mainData.gameId).emit("startGame", true);
      } else {
        io.to(mainData.gameId).emit("allUsers", allUsersByGameId);
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  });

  //User finished all words
  socket.on("userFinished", async (data) => {
    try {
      const mainData = await getMainData(socket);
      io.to(mainData.gameId).emit("gameEnded", mainData.id);
    } catch (error) {
      console.log(error);
      return error;
    }
  });

  //Sent all the users answers
  socket.on("userWords", async (data) => {
    try {
      const mainData = await getMainData(socket);
      socket.broadcast.to(mainData.gameId).emit("otherUserWords", data);
    } catch (error) {
      console.log(error);
      return error;
    }
  });

  socket.on("userVotes", async (data) => {
    try {
      const mainData = await getMainData(socket);
      socket.broadcast.to(mainData.gameId).emit("otherUserVoted", data);
    } catch (error) {
      console.log(error);
      return error;
    }
  });

  socket.on("moderationEnded", async (data) => {
    try {
      const mainData = await getMainData(socket);
      io.to(mainData.gameId).emit("moderationEnded", data);
    } catch (error) {
      console.log(error);
      return error;
    }
  });

  socket.on("resultsContinue", async (data) => {
    try {
      const mainData = await getMainData(socket);
      io.to(mainData.gameId).emit("resultsContinue", data);
    } catch (error) {
      console.log(error);
      return error;
    }
  });
});

//Runs server
server.listen(port, async () => {
  try {
    await Promise.all([deleteAllGames(), deleteAllPlayers()]);
    console.log(`Server running in ${port}`);
  } catch (error) {
    console.log(error);
  }
});
