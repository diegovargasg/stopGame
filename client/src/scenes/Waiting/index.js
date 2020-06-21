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
import { RemotePlayersContext } from "../../RemotePlayersContext";
import socketIOClient from "socket.io-client";

function Waiting(props) {
  const [startGame, setStartGame] = useState(false);
  const [localPlayer, setLocalPlayer] = useContext(LocalPlayerContext);
  const [remotePlayers, setRemotePlayers] = useContext(RemotePlayersContext);
  const [socket, setSocket] = useContext(SocketContext);
  const [game, setGame] = useContext(GameContext);

  //First and only time in which everything is ready, we set and begin the connection with the server
  useEffect(() => {
    if (game.id === "") {
      props.history.push("/");
      return;
    }
    setSocket(
      socketIOClient(
        //"http://ec2-54-93-250-9.eu-central-1.compute.amazonaws.com:5000"
        "http://localhost:5000"
      )
    );
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

    socket.on("allPlayers", (data) => {
      const localPlayer = _.find(data, (player) => {
        return player.id === socket.id;
      });
      const remotePlayers = _.filter(data, (player) => {
        return player.id !== socket.id;
      });
      setRemotePlayers(remotePlayers);
      setLocalPlayer(localPlayer);
    });

    socket.on("startGame", (data) => {
      setStartGame(data);
    });

    socket.on("fatalError", (data) => {
      socket.close();
      props.history.push({
        pathname: "/",
        state: { error: data },
      });
      return;
    });

    socket.on("gameData", (data) => {
      if (_.isEmpty(data.categories) || _.isEmpty(data.letters)) {
        socket.close();
        props.history.push({
          pathname: "/",
          state: { error: "Game doesn't exist" },
        });
        return;
      }

      setGame((game) => ({
        ...game,
        categories: data.categories,
        letters: data.letters,
        rounds: data.rounds,
      }));
    });

    //Unmount cleaup
    return () => {
      socket.off("gameData");
      socket.off("startGame");
      socket.off("allPlayers");
      socket.off("joinGame");
    };
  }, [socket]);

  const handleReady = () => {
    socket.emit("playerReady", !_.get(localPlayer, "ready", false));
  };

  const styleUl = { margin: "1.5rem 0" };
  return (
    <React.Fragment>
      <h5>Waiting for other players...</h5>
      <Alert variant="primary" style={styleUl}>
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
        {localPlayer && (
          <ListGroup.Item
            as="li"
            key={localPlayer.id}
            variant={localPlayer.ready ? "success" : "light"}
          >
            {localPlayer.name}
          </ListGroup.Item>
        )}
        {_.map(remotePlayers, (player) => {
          return (
            <ListGroup.Item
              as="li"
              key={player.id}
              variant={player.ready ? "success" : "light"}
            >
              {player.name}
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
            variant={
              !_.get(localPlayer, "ready", false) ? `primary` : `secondary`
            }
            size="lg"
            block
            onClick={handleReady}
            disabled={remotePlayers.length > 0 ? false : true}
          >
            {!_.get(localPlayer, "ready", false) ? `Ready` : `Not ready`}
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
