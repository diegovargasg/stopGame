import _ from "lodash";
import React, { useState, useEffect, useContext } from "react";
import { GameContext } from "../../GameContext";
import { LocalPlayerContext } from "../../LocalPlayerContext";
import { RemotePlayersContext } from "../../RemotePlayersContext";
import Table from "react-bootstrap/Table";

function Results(props) {
  const [game, setGame] = useContext(GameContext);
  const [remotePlayers, setRemotePlayers] = useContext(RemotePlayersContext);
  const [localPlayer, setLocalPlayer] = useContext(LocalPlayerContext);
  const [totalPointsByPlayer, setTotalPointsByPlayer] = useState([]);
  const tableStyle = { margin: "1rem 0" };

  const getLetterPoints = (letter, points) => {
    let letterPoints = 0;
    _.map(_.get(points, letter, {}), (categoryPoints) => {
      letterPoints += categoryPoints;
    });
    return { [letter]: letterPoints };
  };

  const getTotalPoints = (points) => {
    let totalPoints = 0;
    let singleLetterPoints = {};
    _.map(game.letters, (letter, key) => {
      if (key < game.currentRound) {
        const letterPoints = getLetterPoints(letter, points);
        totalPoints += letterPoints[letter];
        singleLetterPoints[letter] = letterPoints[letter];
      }
    });
    return { totalPoints: totalPoints, ...singleLetterPoints };
  };

  useEffect(() => {
    console.log(totalPointsByPlayer);
  }, [totalPointsByPlayer]);

  useEffect(() => {
    const localPlayerPoints = [
      {
        id: localPlayer.id,
        name: localPlayer.name,
        ...getTotalPoints(localPlayer.points),
      },
    ];

    const remotePlayerPoints = [];
    _.map(remotePlayers, (player) => {
      remotePlayerPoints.push({
        id: player.id,
        name: player.name,
        ...getTotalPoints(player.points),
      });
    });

    const finalAllPoints = _.orderBy(
      _.concat(localPlayerPoints, remotePlayerPoints),
      "totalPoints",
      "desc"
    );

    setTotalPointsByPlayer(finalAllPoints);
  }, []);

  return (
    <React.Fragment>
      <h5>Partial results</h5>
      <Table striped bordered style={tableStyle}>
        <thead>
          <tr>
            <th>Names</th>
            {_.map(game.letters, (letter, key) => {
              if (key < game.currentRound) {
                return <th key={letter}>{letter}</th>;
              }
            })}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {_.map(totalPointsByPlayer, (player) => {
            return (
              <tr key={player.name}>
                <td>{player.name}</td>
                {_.map(game.letters, (letter, key) => {
                  if (key < game.currentRound) {
                    return <td key={letter}>{player[letter]}</td>;
                  }
                })}
                <td>{player.totalPoints}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </React.Fragment>
  );
}

export default Results;
