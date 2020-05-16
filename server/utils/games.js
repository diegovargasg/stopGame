const _ = require("lodash");

const allGames = [];

function addGame({ gameId, categories, letters, rounds }) {
  allGames.push({ id: gameId, categories, letters, rounds, started: false });
  console.log("AllGames", allGames);
}

function getGameDataById(gameId) {
  const game = _.find(allGames, (game) => {
    return game.id === gameId;
  });
  return {
    categories: _.get(game, "categories", []),
    letters: _.get(game, "letters", []),
    rounds: _.get(game, "rounds", 0),
    started: _.get(game, "started", false),
  };
}

function removeGameById(gameId) {
  console.log("Before cleaned", allGames);
  _.remove(allGames, (game) => {
    return game.id === gameId;
  });
  console.log("after cleaned", allGames);
}

function startGameById(gameId) {
  const gameIndex = _.findIndex(allGames, (game) => {
    return game.id === gameId;
  });

  allGames[gameIndex].started = true;
}

module.exports = {
  addGame,
  getGameDataById,
  removeGameById,
  startGameById,
};
