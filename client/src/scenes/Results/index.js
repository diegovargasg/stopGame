import _ from "lodash";
import { Redirect } from "react-router-dom";
import React, { useState, useEffect, useContext } from "react";
import { GameContext } from "../../GameContext";
import { LocalPlayerContext } from "../../LocalPlayerContext";
import { RemotePlayersContext } from "../../RemotePlayersContext";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ProgressBar from "../../components/ProgressBar";

function Results(props) {
  const [game, setGame] = useContext(GameContext);
  const [remotePlayers, setRemotePlayers] = useContext(RemotePlayersContext);
  const [redirect, setRedirect] = useState(false);
  const [localPlayer, setLocalPlayer] = useContext(LocalPlayerContext);
  const [totalPointsByPlayer, setTotalPointsByPlayer] = useState([]);
  const [playedLetters, setPlayedLetters] = useState([]);
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
    _.map(playedLetters, (letter) => {
      const letterPoints = getLetterPoints(letter, points);
      totalPoints += letterPoints[letter];
      singleLetterPoints[letter] = letterPoints[letter];
    });
    return { totalPoints: totalPoints, ...singleLetterPoints };
  };

  const handleContinue = () => {
    setRedirect(true);
  };

  useEffect(() => {
    if (localPlayer.id === "") {
      props.history.push("/");
      return;
    }

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
  }, [playedLetters]);

  useEffect(() => {
    const letters = _.take(game.letters, game.currentRound);
    setPlayedLetters(letters);
  }, []);

  return (
    <React.Fragment>
      <Row>
        <Col>
          <h5>Partial results</h5>
        </Col>
        <Col>
          <ProgressBar
            variant="primary"
            min={0}
            max={10}
            now={10}
            updateRate={1000}
            callBack={handleContinue}
            striped
          />
        </Col>
      </Row>

      <Table striped bordered style={tableStyle}>
        <thead>
          <tr>
            <th>Names</th>
            {_.map(playedLetters, (letter) => {
              return <th key={letter}>{letter}</th>;
            })}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {_.map(totalPointsByPlayer, (player) => {
            return (
              <tr key={player.name}>
                <td>{player.name}</td>
                {_.map(playedLetters, (letter) => {
                  return <td key={letter}>{player[letter]}</td>;
                })}
                <td>{player.totalPoints}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <Button variant="primary" size="lg" block>
        Next round
      </Button>
      {redirect && (
        <Redirect
          to={{
            pathname: "/game",
            push: true,
            state: {},
          }}
        />
      )}
    </React.Fragment>
  );
}

export default Results;
