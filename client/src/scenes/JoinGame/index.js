import React, { useState, useContext } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Redirect } from "react-router-dom";
import { LocalPlayerContext } from "../../LocalPlayerContext";
import { GameContext } from "../../GameContext";

function JoinGame() {
  const [game, setGame] = useContext(GameContext);
  const [valid, setValid] = useState(false);
  const [gameId, setGameId] = useState("");
  const [localPlayer, setLocalPlayer] = useContext(LocalPlayerContext);
  const [name, setName] = useState("");

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    setLocalPlayer((localPlayer) => {
      return { ...localPlayer, name: name };
    });
    setGame((game) => ({
      ...game,
      id: gameId,
      currentRound: 0,
    }));
    setValid(true);
  };

  return (
    <React.Fragment>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="name">
          <Form.Label>Your name:</Form.Label>
          <Form.Control
            type="text"
            required
            minLength="2"
            maxLength="15"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="gameId">
          <Form.Label>Game ID:</Form.Label>
          <Form.Control
            type="text"
            required
            minLength="6"
            maxLength="6"
            autoComplete="off"
            onChange={(event) => {
              setGameId(event.target.value);
            }}
          />
        </Form.Group>
        <Button className="btn btn-primary btn-lg btn-block" type="submit">
          Join
        </Button>
      </Form>
      {valid && (
        <Redirect
          to={{
            pathname: "/waiting",
            push: true,
            state: { name },
          }}
        />
      )}
    </React.Fragment>
  );
}

export default JoinGame;
