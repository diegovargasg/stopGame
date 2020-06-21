import React, { useState, useContext } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import Alert from "react-bootstrap/Alert";
import { Redirect } from "react-router-dom";
import { GameContext } from "../../GameContext";
import { LocalPlayerContext } from "../../LocalPlayerContext";
import { getRandomLetters } from "../../utils";
import Constants from "../../constants";

function CreateGame() {
  const [game, setGame] = useContext(GameContext);
  const [localPlayer, setLocalPlayer] = useContext(LocalPlayerContext);
  const [rounds, setRounds] = useState(3);
  const [categories, setCategories] = useState([]);
  const [redirect, setRedirect] = useState(false);
  const [name, setName] = useState("diego");
  const [catAlert, setCatAlert] = useState(false);

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false || categories.length < 1) {
      event.preventDefault();
      event.stopPropagation();
      setCatAlert(true);
      return false;
    }
    setCatAlert(false);

    const gameId = Math.random().toString(36).substr(2, 6);
    const letters = getRandomLetters(rounds);
    setGame((game) => {
      return {
        ...game,
        id: gameId,
        categories: categories.sort(),
        letters: letters,
        rounds: rounds,
        currentRound: 0,
      };
    });
    setLocalPlayer((localPlayer) => {
      return { ...localPlayer, name: name };
    });
    setRedirect(true);
  };
  const alertStyle = { "margin-top": "1rem" };
  const toggleButtonGroupStyle = { display: "flex" };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="name">
        <Form.Label>Your name:</Form.Label>
        <Form.Control
          type="text"
          required
          minLength="2"
          maxLength="10"
          onChange={(event) => setName(event.target.value)}
          autoComplete="off"
          value={name}
        />
      </Form.Group>
      <Form.Group className="container-fluid">
        <Form.Label className="row">Select your categories:</Form.Label>
        <ToggleButtonGroup
          className="row"
          type="checkbox"
          value={categories}
          style={toggleButtonGroupStyle}
          onChange={(val) => {
            setCategories(val);
          }}
        >
          {Constants.categoriesNames.map((category) => {
            return (
              <ToggleButton
                key={category}
                value={category}
                className="col-4"
                variant={categories.includes(category) ? "primary" : "light"}
                disabled={
                  !categories.includes(category) && categories.length >= 5
                }
              >
                {category}
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>

        {catAlert && (
          <Alert className="row" variant="danger" style={alertStyle}>
            Please select 5 categories
          </Alert>
        )}
      </Form.Group>
      <Form.Group controlId="rounds">
        <Form.Label>Rounds: {rounds}</Form.Label>
        <Form.Control
          min="1"
          max="5"
          value={rounds}
          type="range"
          onChange={(event) => setRounds(event.target.value)}
        />
      </Form.Group>
      <Button className="btn btn-primary btn-lg btn-block" type="submit">
        Create
      </Button>
      {redirect && (
        <Redirect
          to={{
            pathname: "/waiting",
            push: true,
          }}
        />
      )}
    </Form>
  );
}

export default CreateGame;
