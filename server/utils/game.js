const _ = require("lodash");

const games = {};

function storeGameIdWords({ socketId, gameId, letter, words }) {
  games[gameId] = { [letter]: { socketId, words } };
}

function getGameIdWords(gameId, letter) {}

function clearGameIdWords(gameId, letter) {}

function addGame({ gameId, categories, letters }) {
  games[gameId] = { categories, letters };
  console.log(games);
}

function getCategoriesByGameId(gameId) {
  return _.get(games, `${gameId}.categories`, []);
}

function getLetterByGameId(gameId) {
  return _.get(games, `${gameId}.letters`, []);
}

function getGameDataById(gameId) {
  return {
    categories: getCategoriesByGameId(gameId),
    letters: getLetterByGameId(gameId),
  };
}

module.exports = {
  addGame,
  getCategoriesByGameId,
  storeGameIdWords,
  getGameIdWords,
  clearGameIdWords,
  getGameDataById,
};
