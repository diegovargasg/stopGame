import _ from "lodash";
import React, { useState, useEffect, useRef, useContext } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Form from "react-bootstrap/Form";
import { SocketContext } from "../../SocketContext";

function Game(props) {
  const [words, setWords] = useState({});
  const [stopDisabled, setStopDisabled] = useState(true);
  const [gameEnded, setGameEnded] = useState(false);
  //const [categories, setCategories] = useState([]);
  const categories = ["Names", "Animals", "Countries", "Food", "Brands"];
  const [socket, setSocket] = useContext(SocketContext);

  const onAdd = (category, word) => {
    setWords((words) => ({ ...words, [category]: word }));
  };

  useEffect(() => {
    socket.on("stopGame", (data) => {
      console.log("stopped game by ", data);
    });
  }, []);

  useEffect(() => {
    if (_.size(words) === 5) {
      setStopDisabled(false);
    }
  }, [words]);

  useEffect(() => {
    //handle sent message to server and moderation
    if (gameEnded) {
      socket.emit("userStop", "hello world");
    }
  }, [gameEnded]);

  const handleClick = () => {
    setGameEnded(true);
    setStopDisabled(true);
  };

  return (
    <React.Fragment>
      <h5>
        Words that begins with: <Badge variant="dark">R</Badge>
      </h5>
      <Table striped bordered>
        <thead>
          <tr>
            <th>Category</th>
            <th>Word</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => {
            return (
              <Category
                key={category}
                name={category}
                onAdd={onAdd}
                gameEnded={gameEnded}
              />
            );
          })}
        </tbody>
      </Table>
      <Button
        variant={stopDisabled ? "secondary" : "primary"}
        disabled={stopDisabled}
        onClick={handleClick}
        size="lg"
        block
      >
        STOP
      </Button>
    </React.Fragment>
  );
}

export function Category(props) {
  const [disabled, setDisabled] = useState(true);
  const input = useRef(null);

  useEffect(() => {
    if (!disabled) {
      input.current.focus();
    }
  });

  const handleClick = () => {
    const word = input.current.value;
    //stores the word
    if (!disabled && word !== "") {
      props.onAdd(props.name, word);
    }
    setDisabled(!disabled);
  };

  return (
    <tr key={props.name}>
      <td>{props.name}</td>
      <td>
        <Form.Control type="text" disabled={disabled} ref={input} />
      </td>
      <td align="right">
        <Button
          disabled={props.gameEnded}
          variant={disabled ? "primary" : "success"}
          onClick={handleClick}
        >
          {disabled ? "add" : "save"}
        </Button>
      </td>
    </tr>
  );
}

export default Game;
