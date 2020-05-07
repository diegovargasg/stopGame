import _ from "lodash";
import React, { useState, useEffect, useRef, useContext } from "react";
import { Redirect } from "react-router-dom";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Form from "react-bootstrap/Form";
import Overlay from "react-bootstrap/Overlay";
import Tooltip from "react-bootstrap/Tooltip";
import { SocketContext } from "../../SocketContext";

function Game(props) {
  const name = _.get(props, "location.state.name", "");
  const categories = _.get(props, "location.state.categories", []);
  const tmpCat = {};
  categories.map((category) => {
    tmpCat[category] = "";
  });
  const [letter, setLetter] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [counterLetter, setCounterLetter] = useState(0);
  const [showBegin, setShowBegin] = useState(false);
  const [words, setWords] = useState(tmpCat);
  const [stopBtnDisabled, setStopBtnDisabled] = useState(true);
  const [socket, setSocket] = useContext(SocketContext);
  const [redirect, setRedirect] = useState(false);
  const letterBadge = useRef(null);

  const onAdd = (category, word) => {
    setWords((words) => ({ ...words, [category]: word }));
    setShowBegin(false);
  };

  const getRandomLetter = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return chars.charAt(Math.floor(Math.random() * chars.length));
  };

  useEffect(() => {
    if (socket === null) {
      props.history.push("/");
      return;
    }

    socket.on("gameEnded", (data) => {
      setRedirect(data);
    });
  }, []);

  useEffect(() => {
    /*let timerId = setInterval(() => {
      console.log(counterLetter);
      if (counterLetter > 5) {
        clearInterval(timerId);
      }
      setLetter(getRandomLetter());
      setCounterLetter(counterLetter + 1);
    }, 250);
  */
  }, [counterLetter]);

  /*useEffect(() => {
    console.log(counterLetter);
    if (counterLetter >= 5000) {
      setGameStarted(true);
      setShowBegin(true);
      return;
    }
    setLetter(getRandomLetter());
  }, [counterLetter]);

  useEffect(() => {
    let timerId = setTimeout(() => {
      setCounterLetter(counterLetter + 200);
    }, 200);
  }, [letter]);*/

  useEffect(() => {
    //enable STOP button when all words are filled
    if (!Object.values(words).includes("")) {
      setStopBtnDisabled(false);
    }
  }, [words]);

  /*useEffect(() => {
    //handle sent message to server and moderation
    if (gameEnded) {
      socket.emit("userWords", { words, letter });
    }
  }, [gameEnded]);*/

  const handleClick = () => {
    setStopBtnDisabled(true);
    socket.emit("userFinished", true);
  };

  return (
    <React.Fragment>
      <h5>
        Words that begin with the letter{" "}
        <span className="h3">
          <Badge
            ref={letterBadge}
            variant={gameStarted ? "primary" : "secondary"}
          >
            {letter}
          </Badge>
        </span>
        <Overlay
          target={letterBadge.current}
          show={showBegin}
          placement="right"
        >
          {(props) => (
            <Tooltip id="overlay-example" {...props}>
              Play!
            </Tooltip>
          )}
        </Overlay>
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
                gameEnded={redirect}
                gameStarted={gameStarted}
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
      {redirect && (
        <Redirect
          to={{
            pathname: "/moderation",
            push: true,
            state: {
              gameData: {
                socketId: socket.id,
                words: words,
                name: name,
              },
              letter,
              categories,
            },
          }}
        />
      )}
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
          disabled={props.gameEnded || props.gameStarted === false}
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
