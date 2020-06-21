const express = require("express");
const _ = require("lodash");
const cors = require("cors");
const port = process.env.PORT || "5000";
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const {
  getPlayer,
  addPlayer,
  removePlayer,
  getAllPlayersByGameId,
  removeAllPlayersByGameId,
  updatePlayer,
  allPlayersReady,
  updateAllPlayersByGameId,
  deleteAllPlayers,
} = require("./utils/players");

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
    const player = await getPlayer(id);
    const gameId = _.get(player, "gameId", "");
    return { id, player, gameId };
  } catch (error) {
    return error;
  }
};

const destroyGameAndPlayers = async (gameId) => {
  try {
    Promise.all([removeAllPlayersByGameId(gameId), removeGameById(gameId)]);
  } catch (error) {
    return error;
  }
};

//Run when client connects
io.on("connection", (socket) => {
  //Player has joined a game
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
      const response = await addPlayer({ id, gameId, name, ready });
      socket.join(gameId);

      //If the player was not created
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

      const allPlayersByGameId = await getAllPlayersByGameId(gameId);
      io.to(gameId).emit("allPlayers", allPlayersByGameId);
    } catch (error) {
      return error;
    }
  });

  //used when the game finished
  socket.on("cleanGame", async (gameId) => {
    try {
      await destroyGamePlayers(gameId);
    } catch (error) {
      return error;
    }
  });

  socket.on("disconnect", async () => {
    try {
      const mainData = await getMainData(socket);

      await Promise.all([
        removePlayer(mainData.id),
        updateAllPlayersByGameId({ gameId: mainData.gameId, ready: false }),
      ]);

      const [allPlayersByGameId, gameData] = await Promise.all([
        getAllPlayersByGameId(mainData.gameId),
        getGameDataById(mainData.gameId),
      ]);

      if (_.size(allPlayersByGameId) > 1) {
        //someone left and the game hasn't started
        io.to(mainData.gameId).emit("allPlayers", allPlayersByGameId);
      } else if (_.size(allPlayersByGameId) <= 1 && gameData.started) {
        //everyone left and the game has already started
        await destroyGameAndPlayers(mainData.gameId);
        io.to(mainData.gameId).emit("fatalError", "All your opponents left");
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  });

  //player is ready
  socket.on("playerReady", async (ready) => {
    try {
      const mainData = await getMainData(socket);

      const response = await updatePlayer(mainData.id, ready);
      if (response.status !== 201) {
        console.log(response);
        throw "player update failed";
      }

      const allPlayersByGameId = await getAllPlayersByGameId(mainData.gameId);
      const areAllPlayersReady = allPlayersReady(allPlayersByGameId);

      if (areAllPlayersReady) {
        await updateGameById(mainData.gameId, true);
        io.to(mainData.gameId).emit("startGame", true);
      } else {
        io.to(mainData.gameId).emit("allPlayers", allPlayersByGameId);
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  });

  //Player finished all words
  socket.on("playerFinished", async (data) => {
    try {
      const mainData = await getMainData(socket);
      io.to(mainData.gameId).emit("gameEnded", mainData.id);
    } catch (error) {
      console.log(error);
      return error;
    }
  });

  //Sent all the players answers
  socket.on("playerWords", async (data) => {
    try {
      const mainData = await getMainData(socket);
      socket.broadcast.to(mainData.gameId).emit("otherPlayerWords", data);
    } catch (error) {
      console.log(error);
      return error;
    }
  });

  socket.on("playerVotes", async (data) => {
    try {
      const mainData = await getMainData(socket);
      socket.broadcast.to(mainData.gameId).emit("otherPlayerVoted", data);
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
