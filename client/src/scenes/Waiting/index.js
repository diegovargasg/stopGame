import _ from "lodash";
import React, { useState, useEffect, useContext } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import { Redirect } from "react-router-dom";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { useHistory } from "react-router-dom";
import { SocketContext } from "../../SocketContext";
import socketIOClient from "socket.io-client";

function Waiting(props) {
  const history = useHistory();
  const [players, setPlayers] = useState([]);
  const [player, setPlayer] = useState({});
  const [startGame, setStartGame] = useState(false);
  const [socket, setSocket] = useContext(SocketContext);
  const gameId = _.get(props, "location.state.gameId", "");
  const name = _.get(props, "location.state.name", "");
  const categories = _.get(props, "location.state.categories", []);

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

    socket.emit("joinGame", { gameId, name });
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
  }, [socket]);

  const handleReady = () => {
    socket.emit("userReady", !_.get(player, "ready", false));
  };

  return (
    <React.Fragment>
      <h2>Waiting for players...</h2>
      <Alert variant="primary">
        Game Id: <b>{gameId}</b>
      </Alert>
      <ListGroup as="ul">
        {players.map((player, idx) => {
          return (
            <ListGroup.Item
              as="li"
              key={idx}
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
              history.push("/");
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
            state: { categories },
          }}
        />
      )}
    </React.Fragment>
  );
}

export default Waiting;
