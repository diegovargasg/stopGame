import _ from "lodash";
import React, { useState, useEffect, useRef } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import Alert from "react-bootstrap/Alert";
import { Redirect } from "react-router-dom";

function CreateGame() {
  const [rounds, setRounds] = useState(5);
  const [letters, setLetters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [valid, setValid] = useState(false);
  const [name, setName] = useState();
  const [catAlert, setCatAlert] = useState({ display: "none" });
  const gameId = Math.random().toString(36).substr(2, 6);
  const inputName = useRef(null);
  const categoriesNames = [
    "Names",
    "Animals",
    "Countries",
    "Food",
    "Brands",
    "Professions",
    "Objects",
    "Colors",
    "Cities",
    "Songs",
    "Sports",
    "Movies",
  ];

  const handleCategories = (val) => {
    setCategories(val);
  };

  const getRandomLetters = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let lettersSet = new Set();

    while (lettersSet.size < rounds) {
      const char = chars.charAt(Math.floor(Math.random() * chars.length));
      lettersSet.add(char);
    }
    return Array.from(lettersSet);
  };

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false /*|| categories.length < 5*/) {
      event.preventDefault();
      event.stopPropagation();
      setCatAlert({ display: "block" });
      return false;
    }
    setLetters(getRandomLetters());
    setCatAlert({ display: "none" });
    setValid(true);
    setName(_.get(inputName, "current.value", ""));
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="name">
        <Form.Label>Your name:</Form.Label>
        <Form.Control
          type="text"
          required
          minLength="2"
          maxLength="15"
          ref={inputName}
          autoComplete="off"
          value="Diego"
        />
      </Form.Group>
      <Form.Group className="col">
        <Form.Label className="row">Select your categories:</Form.Label>
        <ToggleButtonGroup
          className="row"
          type="checkbox"
          value={categories}
          onChange={handleCategories}
        >
          {categoriesNames.map((category) => {
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
        <Alert className="row" variant="danger" style={catAlert}>
          Please select 5 categories
        </Alert>
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
      {valid && (
        <Redirect
          to={{
            pathname: "/waiting",
            push: true,
            state: {
              name,
              gameId,
              letters,
              categories: categories.sort(),
            },
          }}
        />
      )}
    </Form>
  );
}

export default CreateGame;
