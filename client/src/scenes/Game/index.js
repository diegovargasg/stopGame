import _ from "lodash";
import React, { useState, useEffect, useRef, useContext } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Form from "react-bootstrap/Form";
import { SocketContext } from "../../SocketContext";

function Game(props) {
  const categories = _.get(props, "location.state.categories", []);
  const tmpCat = {};
  categories.map((category) => {
    tmpCat[category] = "";
  });
  const [words, setWords] = useState(tmpCat);
  const [stopBtnDisabled, setStopBtnDisabled] = useState(true);
  const [gameEnded, setGameEnded] = useState(false);
  const [socket, setSocket] = useContext(SocketContext);

  const onAdd = (category, word) => {
    setWords((words) => ({ ...words, [category]: word }));
  };

  useEffect(() => {
    if (socket === null) {
      props.history.push("/");
      return;
    }

    socket.on("gameEnded", (data) => {
      setGameEnded(data);
    });
  }, []);

  useEffect(() => {
    //enable STOP button when all words are filled
    if (!Object.values(words).includes("")) {
      setStopBtnDisabled(false);
    }
  }, [words]);

  useEffect(() => {
    //handle sent message to server and moderation
    if (gameEnded) {
      //@TODO: sanitize words sent
      socket.emit("userWords", words);
    }
  }, [gameEnded]);

  const handleClick = () => {
    setStopBtnDisabled(true);
    socket.emit("userFinished", true);
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
        variant={stopBtnDisabled ? "secondary" : "primary"}
        disabled={stopBtnDisabled}
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
    const word = _.upperFirst(
      _.truncate(_.trim(_.escape(input.current.value)), {
        length: 24,
      })
    );
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
        <Form.Control
          type="text"
          disabled={disabled}
          ref={input}
          maxLength={24}
        />
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
