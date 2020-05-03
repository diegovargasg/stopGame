const _ = require("lodash");

const allUsers = [];

function addUser({ socketId, gameId, name, ready }) {
  allUsers.push({ socketId, gameId, name, ready });
  console.log(allUsers);
}

function getUser(socketId) {
  return _.find(allUsers, (user) => {
    return user.socketId === socketId;
  });
}

function getAllUsersByGameId(gameId) {
  return _.filter(allUsers, (user) => {
    return user.gameId === gameId;
  });
}

function removeUser(socketId) {
  return _.remove(allUsers, (user) => {
    return user.socketId === socketId;
  });
}

function updateUserReady(socketId, ready) {
  const userIndex = _.findIndex(allUsers, (user) => {
    return user.socketId === socketId;
  });

  _.set(allUsers, `${userIndex}.ready`, ready);
}

module.exports = {
  getAllUsersByGameId,
  getUser,
  addUser,
  removeUser,
  updateUserReady,
};
