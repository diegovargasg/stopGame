import _ from "lodash";
import React, { useState, useEffect, useContext } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import { Redirect } from "react-router-dom";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { SocketContext } from "../../SocketContext";
import { GameContext } from "../../GameContext";
import { LocalPlayerContext } from "../../LocalPlayerContext";
import socketIOClient from "socket.io-client";

function Waiting(props) {
  const [players, setPlayers] = useState([]);
  const [player, setPlayer] = useState({});
  const [startGame, setStartGame] = useState(false);
  const [localPlayer, setLocalPlayer] = useContext(LocalPlayerContext);
  const [socket, setSocket] = useContext(SocketContext);
  const [game, setGame] = useContext(GameContext);

  //@TODO move this to config
  const ENDPOINT = "http://localhost:9000/";

  //First and only time in which everything is ready, we set and begin the connection with the server
  useEffect(() => {
    setSocket(socketIOClient(ENDPOINT));
    return () => {
      //onUnmount do clean-up events here
    };
  }, []);

  useEffect(() => {
    if (socket === null) {
      return;
    }

    socket.emit("joinGame", {
      id: game.id,
      name: localPlayer.name,
      categories: game.categories,
      letters: game.letters,
      rounds: game.rounds,
    });

    setLocalPlayer((localPlayer) => {
      return {
        ...localPlayer,
        id: socket.id,
      };
    });

    socket.on("allUsers", (data) => {
      const currentPlayer = _.find(data, (player) => {
        return player.socketId === socket.id;
      });
      setPlayers(data);
      setPlayer(currentPlayer);
    });

    socket.on("startGame", (data) => {
      setStartGame(data);
    });

    socket.on("gameData", (data) => {
      setGame((game) => ({
        ...game,
        categories: data.categories,
        letters: data.letters,
        rounds: data.rounds,
      }));
    });
  }, [socket]);

  const handleReady = () => {
    socket.emit("userReady", !_.get(player, "ready", false));
  };

  const styleUl = { margin: "1rem 0" };

  return (
    <React.Fragment>
      <h5>Waiting for other players...</h5>
      <Alert variant="primary">
        <p>
          <b>Game ID: </b>
          {game.id}
        </p>
        <p>
          <b>Categories: </b>
          {game.categories.join(", ")}
        </p>
        <p>
          <b>Rounds: </b>
          {game.rounds}
        </p>
      </Alert>
      <ListGroup style={styleUl} as="ul">
        {players.map((player, idx) => {
          return (
            <ListGroup.Item
              as="li"
              key={idx}
              variant={player.ready ? "success" : "light"}
            >
              {player.name} {localPlayer.id}
            </ListGroup.Item>
          );
        })}
      </ListGroup>
      <Row>
        <Col>
          <Button
            variant="light"
            size="lg"
            block
            onClick={() => {
              socket.close();
              props.history.push("/");
            }}
          >
            Back
          </Button>
        </Col>
        <Col>
          <Button
            variant={!_.get(player, "ready", false) ? `primary` : `secondary`}
            size="lg"
            block
            onClick={handleReady}
            disabled={players.length <= 1 ? false : false}
          >
            {!_.get(player, "ready", false) ? `Ready` : `Not ready`}
          </Button>
        </Col>
      </Row>
      {startGame && (
        <Redirect
          to={{
            pathname: "/game",
            push: true,
          }}
        />
      )}
    </React.Fragment>
  );
}

export default Waiting;
