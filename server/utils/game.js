const _ = require("lodash");

const games = {};

function storeGameIdWords({ socketId, gameId, letter, words }) {
  games[gameId] = { [letter]: { socketId, words } };
}

function getGameIdWords(gameId, letter) {}

function clearGameIdWords(gameId, letter) {}

function addGame({ gameId, categories }) {
  games[gameId] = { categories };
}

function getCategoriesByGameId(gameId) {
  return _.get(games, `${gameId}.categories`, []);
}

module.exports = {
  addGame,
  getCategoriesByGameId,
  storeGameIdWords,
  getGameIdWords,
  clearGameIdWords,
};
