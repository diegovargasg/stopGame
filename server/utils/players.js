//@TODO: migrate this to a class?
const _ = require("lodash");
const axios = require("axios");

const axiosObj = axios.create({
  baseURL: "https://b5l0f7pdee.execute-api.eu-central-1.amazonaws.com/prod",
  headers: { "Content-Type": "application/json" },
});

async function addPlayer({ id, gameId, name, ready }) {
  try {
    const response = await axiosObj.post(`/player/${id}`, {
      id,
      gameId,
      name,
      ready,
    });
    return response;
  } catch (error) {
    return error;
  }
}

async function getPlayer(id) {
  try {
    const response = await axiosObj.get(`/player/${id}`);
    return response.data.Item;
  } catch (error) {
    return error;
  }
}

async function getAllPlayersByGameId(gameId) {
  try {
    const response = await axiosObj.get(`/players/${gameId}`);
    return response.data.Items;
  } catch (error) {
    return error;
  }
}

async function removeAllPlayersByGameId(gameId) {
  try {
    await axiosObj.delete(`/players/${gameId}`);
  } catch (error) {
    return error;
  }
}

async function removePlayer(id) {
  try {
    const response = await axiosObj.delete(`/player/${id}`);
    return response;
  } catch (error) {
    return error;
  }
}

async function updatePlayer(id, ready) {
  try {
    const response = await axiosObj.patch(`/player/${id}`, {
      ready,
    });
    return response;
  } catch (error) {
    return error;
  }
}

function allPlayersReady(allPlayersByGameId) {
  return (
    _.size(
      _.filter(allPlayersByGameId, (player) => {
        return player.ready === true;
      })
    ) === allPlayersByGameId.length
  );
}

async function updateAllPlayersByGameId({ gameId, ready }) {
  try {
    const response = await axiosObj.put(`/players/${gameId}`, {
      ready: ready,
    });
    return response.data.Item;
  } catch (error) {
    return error;
  }
}

async function deleteAllPlayers() {
  try {
    const response = await axiosObj.delete(`/players`);
    return response;
  } catch (error) {
    return error;
  }
}

module.exports = {
  getAllPlayersByGameId,
  removeAllPlayersByGameId,
  getPlayer,
  addPlayer,
  removePlayer,
  updatePlayer,
  allPlayersReady,
  updateAllPlayersByGameId,
  deleteAllPlayers,
};
