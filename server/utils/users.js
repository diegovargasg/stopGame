//@TODO: migrate this to a class?
const _ = require("lodash");

const allUsers = [];

function addUser({ id, gameId, name, ready, points }) {
  allUsers.push({ id, gameId, name, ready, points });
  console.log("AllUsers", allUsers);
}

function getUser(id) {
  return _.find(allUsers, (user) => {
    return user.id === id;
  });
}

function getAllUsersByGameId(gameId) {
  return _.filter(allUsers, (user) => {
    return user.gameId === gameId;
  });
}

function removeAllUsersByGameId(gameId) {
  return _.remove(allUsers, (user) => {
    return user.gameId === gameId;
  });
}

function removeUser(id) {
  console.log("Before cleaned", allUsers);
  _.remove(allUsers, (user) => {
    return user.id === id;
  });
  console.log("After Cleaned", allUsers);
}

function updateUserReady(id, ready) {
  const userIndex = _.findIndex(allUsers, (user) => {
    return user.id === id;
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
  removeAllUsersByGameId,
  getUser,
  addUser,
  removeUser,
  updateUserReady,
  allUsersReady,
  unReadyAllUsersByGameId,
};
