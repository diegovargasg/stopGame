//@TODO: migrate this to a class?
const _ = require("lodash");

const allUsers = [];

function addUser({ socketId, gameId, name, ready, points }) {
  allUsers.push({ socketId, gameId, name, ready, points });
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
  getUser,
  addUser,
  removeUser,
  updateUserReady,
  allUsersReady,
  unReadyAllUsersByGameId,
};
