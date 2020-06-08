//@TODO: migrate this to a class?
const _ = require("lodash");
const axios = require("axios");

const allUsers = [];
const axiosObj = axios.create({
  baseURL: "https://b5l0f7pdee.execute-api.eu-central-1.amazonaws.com/prod",
  timeout: 1000,
  headers: { "Content-Type": "application/json" },
});

async function addUser({ id, gameId, name, ready, points }) {
  allUsers.push({ id, gameId, name, ready, points });

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
    return response.data.Item;
  } catch (error) {
    return error;
  }
}

async function getAllUsersByGameId(gameId) {
  try {
    const response = await axiosObj.get(`/players/${gameId}`);
    return response.data.Item;
  } catch (error) {
    return error;
  }
  return _.filter(allUsers, (user) => {
    return user.gameId === gameId;
  });
}

async function removeAllUsersByGameId(gameId) {
  try {
    const response = await axiosObj.delete(`/players/${gameId}`);
    return response.data.Item;
  } catch (error) {
    return error;
  }
  return _.remove(allUsers, (user) => {
    return user.gameId === gameId;
  });
}

async function removeUser(id) {
  console.log("Before cleaned", allUsers);
  _.remove(allUsers, (user) => {
    return user.id === id;
  });
  console.log("After Cleaned", allUsers);

  try {
    const response = await axiosObj.delete(`/player/${id}`);
    return response;
  } catch (error) {
    return error;
  }
}

async function updateUserReady(id, ready) {
  const userIndex = _.findIndex(allUsers, (user) => {
    return user.id === id;
  });

  _.set(allUsers, `${userIndex}.ready`, ready);
  try {
    const response = await axiosObj.patch(`/player/${id}`, {
      id,
      ready,
    });
    console.log(response);
    return response;
  } catch (error) {
    return error;
  }
}

function allUsersReady(gameId) {
  return (
    _.size(
      _.filter(allUsers, (user) => {
        return user.gameId === gameId && user.ready === true;
      })
    ) === getAllUsersByGameId(gameId).length
  );
}

function unReadyAllUsersByGameId(gameId) {
  _.forEach(allUsers, (user, key) => {
    if (user.gameId === gameId) {
      _.set(allUsers, `${key}.ready`, false);
    }
  });
}

module.exports = {
  getAllUsersByGameId,
  removeAllUsersByGameId,
  getUser,
  addUser,
  removeUser,
  updateUserReady,
  allUsersReady,
  unReadyAllUsersByGameId,
};
