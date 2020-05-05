import _ from "lodash";
import React, { useState, useEffect, useRef } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Redirect } from "react-router-dom";

function JoinGame() {
  const [valid, setValid] = useState(false);
  const [gameId, setGameId] = useState("");
  const [name, setName] = useState();
  const inputName = useRef(null);
  const inputGameId = useRef(null);

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    setName(_.get(inputName, "current.value"), "");
    setGameId(_.get(inputGameId, "current.value"), "");
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
            ref={inputName}
          />
        </Form.Group>
        <Form.Group controlId="gameId">
          <Form.Label>Game ID:</Form.Label>
          <Form.Control
            type="text"
            required
            minLength="6"
            maxLength="6"
            ref={inputGameId}
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
            state: { name, gameId },
          }}
        />
      )}
    </React.Fragment>
  );
}

export default JoinGame;
