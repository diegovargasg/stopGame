//@TODO: migrate this to a class?
const _ = require("lodash");
const axios = require("axios");

const axiosObj = axios.create({
  baseURL: "https://b5l0f7pdee.execute-api.eu-central-1.amazonaws.com/prod",
  timeout: 1000,
  headers: { "Content-Type": "application/json" },
});

async function addUser({ id, gameId, name, ready, points }) {
  try {
    const response = await axiosObj.post(`/player/${id}`, {
      id,
      gameId,
      name,
      ready,
      points,
    });
    return response;
  } catch (error) {
    return error;
  }
}

async function getUser(id) {
  try {
    const response = await axiosObj.get(`/player/${id}`);
    console.log(response.data.Item);
    return response.data.Item;
  } catch (error) {
    return error;
  }
}

async function getAllUsersByGameId(gameId) {
  try {
    const response = await axiosObj.get(`/players/${gameId}`);
    return response.data.Items;
  } catch (error) {
    return error;
  }
}

async function removeAllUsersByGameId(gameId) {
  try {
    await axiosObj.delete(`/players/${gameId}`);
  } catch (error) {
    return error;
  }
}

async function removeUser(id) {
  try {
    const response = await axiosObj.delete(`/player/${id}`);
    return response;
  } catch (error) {
    return error;
  }
}

async function updateUser(id, ready) {
  try {
    const response = await axiosObj.patch(`/player/${id}`, {
      id,
      ready,
    });
    return response;
  } catch (error) {
    return error;
  }
}

async function allUsersReady(gameId) {
  const allUsersByGameId = await getAllUsersByGameId(gameId);
  return (
    _.size(
      _.filter(allUsersByGameId, (user) => {
        return user.gameId === gameId && user.ready === true;
      })
    ) === allUsersByGameId.length
  );
}

async function updateAllUsersByGameId({ gameId, ready }) {
  try {
    const response = await axiosObj.put(`/players/${gameId}`, {
      ready: ready,
    });
    return response.data.Item;
  } catch (error) {
    return error;
  }
}

module.exports = {
  getAllUsersByGameId,
  removeAllUsersByGameId,
  getUser,
  addUser,
  removeUser,
  updateUser,
  allUsersReady,
  updateAllUsersByGameId,
};
