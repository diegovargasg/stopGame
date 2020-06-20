const _ = require("lodash");
const axios = require("axios");

const axiosObj = axios.create({
  baseURL: "https://b5l0f7pdee.execute-api.eu-central-1.amazonaws.com/prod",
  timeout: 1000,
  headers: { "Content-Type": "application/json" },
});

const allGames = [];

async function addGame({ id, categories, letters, rounds }) {
  allGames.push({ id, categories, letters, rounds, started: false });
  try {
    const response = await axiosObj.post(`/game/${id}`, {
      id,
      categories,
      letters,
      rounds,
      started: false,
    });
    return response;
  } catch (error) {
    return error;
  }
}

async function getGameDataById(id) {
  /* const game = _.find(allGames, (game) => {
    return game.id === id;
  });
 */
  try {
    const response = await axiosObj.get(`/game/${id}`);

    if (response.data.Count === 0) {
      return {
        categories: [],
        letters: [],
        rounds: 0,
        started: false,
      };
    }
    return {
      categories: JSON.parse(response.data.Item.categories),
      letters: JSON.parse(response.data.Item.letters),
      rounds: response.data.Item.rounds,
      started: response.data.Item.started,
    };
  } catch (error) {
    return error;
  }

  return {
    categories: _.get(game, "categories", []),
    letters: _.get(game, "letters", []),
    rounds: _.get(game, "rounds", 0),
    started: _.get(game, "started", false),
  };
}

async function removeGameById(id) {
  _.remove(allGames, (game) => {
    return game.id === id;
  });
  try {
    const response = await axiosObj.delete(`/game/${id}`);
    return response;
  } catch (error) {
    return error;
  }
}

async function updateGameById(id, started) {
  try {
    const response = await axiosObj.put(`/game/${id}`, { started });
    return response;
  } catch (error) {
    return error;
  }
}

module.exports = {
  addGame,
  getGameDataById,
  removeGameById,
  updateGameById,
};
