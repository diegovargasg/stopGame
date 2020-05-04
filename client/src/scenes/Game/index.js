import _ from "lodash";
import React, { useState, useEffect } from "react";
import Carousel from "react-bootstrap/Carousel";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

function Game(props) {
  const [index, setIndex] = useState(0);
  const [categories, setCategories] = useState([]);

  const divStyle = {
    color: "black",
    textAlign: "center",
  };

  useEffect(() => {
    setCategories(_.get(props, "location.state.categories", []));
  }, []);

  const handleContinue = () => {};

  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };

  return (
    <React.Fragment>
      <h2>Game</h2>
      <Carousel
        interval="240000"
        indicators={false}
        activeIndex={index}
        onSelect={handleSelect}
      >
        {categories.map((category) => {
          return (
            <Carousel.Item style={divStyle} key={category}>
              <h3>{category}</h3>
            </Carousel.Item>
          );
        })}
      </Carousel>
      <Form>
        <Form.Group controlId="name">
          <Form.Label>Your word:</Form.Label>
          <Form.Control type="text" required minLength="2" maxLength="15" />
        </Form.Group>
        <Button
          className="btn btn-primary btn-lg btn-block"
          onClick={handleContinue}
        >
          Continue
        </Button>
      </Form>
    </React.Fragment>
  );
}

export default Game;
