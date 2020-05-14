const _ = require("lodash");

const games = {};

function getGameIdWords(gameId, letter) {}

function clearGameIdWords(gameId, letter) {}

function addGame({ gameId, categories, letters, rounds }) {
  games[gameId] = { categories, letters, rounds };
}

function getCategoriesByGameId(gameId) {
  return _.get(games, `${gameId}.categories`, []);
}

function getLetterByGameId(gameId) {
  return _.get(games, `${gameId}.letters`, []);
}

function getRoundsByGameId(gameId) {
  return _.get(games, `${gameId}.rounds`, []);
}

function getGameDataById(gameId) {
  return {
    categories: getCategoriesByGameId(gameId),
    letters: getLetterByGameId(gameId),
    rounds: getRoundsByGameId(gameId),
  };
}

module.exports = {
  addGame,
  getGameIdWords,
  clearGameIdWords,
  getGameDataById,
};
