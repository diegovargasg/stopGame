import _ from "lodash";
import React, { useState, useEffect, useRef } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Redirect } from "react-router-dom";

function CreateGame() {
  const [range, setRange] = useState(5);
  const [categories, setCategories] = useState([]);
  const [valid, setValid] = useState(false);
  const [name, setName] = useState();
  const gameId = Math.random().toString(36).substr(2, 6);
  const inputName = useRef(null);

  useEffect(() => {}, []);

  const handleCategories = (changeEvent) => {
    const optionsSelected = [...changeEvent.target.options]
      .filter((option) => option.selected)
      .map((option) => option.value);

    if (optionsSelected.length > 5) {
      changeEvent.target.options[0].selected = false;
      optionsSelected.splice(0, 1);
    }
    setCategories(optionsSelected);
  };

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    setValid(true);
    setName(_.get(inputName, "current.value", ""));
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h2>Create game</h2>
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
      <Form.Group controlId="categories">
        <Form.Label>Categories: {categories.length}</Form.Label>
        <Form.Control as="select" multiple onChange={handleCategories}>
          <option>Names</option>
          <option>Countries</option>
          <option>Animals</option>
          <option>Food</option>
          <option>Brands</option>
          <option>Profession</option>
          <option>Objects</option>
          <option>Color</option>
          <option>Songs</option>
          <option>Sports</option>
        </Form.Control>
      </Form.Group>
      <Form.Group controlId="rounds">
        <Form.Label>Rounds: {range}</Form.Label>
        <Form.Control
          min="1"
          max="5"
          value={range}
          type="range"
          onChange={(event) => setRange(event.target.value)}
        />
      </Form.Group>
      <Button className="btn btn-primary btn-lg btn-block" type="submit">
        Create
      </Button>
      {valid && (
        <Redirect
          to={{
            pathname: "/waiting",
            state: { name, gameId, categories },
          }}
        />
      )}
    </Form>
  );
}

export default CreateGame;
