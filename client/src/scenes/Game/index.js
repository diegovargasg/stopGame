import _ from "lodash";
import React, { useState, useEffect, useRef, useContext } from "react";
import { Redirect } from "react-router-dom";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Overlay from "react-bootstrap/Overlay";
import Tooltip from "react-bootstrap/Tooltip";
import ProgressBar from "../../components/ProgressBar";
import RandomLetter from "../../components/RandomLetter";
import { SocketContext } from "../../SocketContext";
import { GameContext } from "../../GameContext";

function Game(props) {
  const letterBadge = useRef(null);

  const [letter, setLetter] = useState("");
  const [finalLetter, setFinalLetter] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [showBegin, setShowBegin] = useState(false);
  const [words, setWords] = useState({});
  const [stopBtnDisabled, setStopBtnDisabled] = useState(true);
  const [game, setGame] = useContext(GameContext);
  const [socket, setSocket] = useContext(SocketContext);
  const [gameEnded, setGameEnded] = useState(false);

  const onAdd = (category, word) => {
    setWords((words) => ({ ...words, [category]: word }));
    setShowBegin(false);
  };

  useEffect(() => {
    if (socket === null || game.id === "") {
      props.history.push("/");
      return;
    }

    socket.on("gameEnded", (data) => {
      setGameEnded(data);
    });

    //@TODO refator this
    const tmpCat = {};
    game.categories.map((category) => {
      tmpCat[category] = "";
    });

    setWords(tmpCat);
    setFinalLetter(game.letters[game.currentRound]);
  }, []);

  const randomLetterEnded = () => {
    setGameStarted(true);
    setShowBegin(true);
  };

  const stopProgressBar = () => {
    setGameStarted(false);
    setGameEnded(true);
  };

  useEffect(() => {
    //enable STOP button when all words are filled
    if (Object.values(words).includes("")) {
      setStopBtnDisabled(true);
    } else {
      setStopBtnDisabled(false);
    }
  }, [words]);

  const handleClick = () => {
    setStopBtnDisabled(true);
    socket.emit("userFinished", true);
  };

  return (
    <React.Fragment>
      <h5>
        Words that begin with the letter{" "}
        {finalLetter && (
          <span className="h3" ref={letterBadge}>
            <RandomLetter
              counter={10}
              speed={250}
              callBack={randomLetterEnded}
              finalLetter={finalLetter}
            />
          </span>
        )}
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
            <th>
              {gameStarted && (
                <ProgressBar
                  variant="primary"
                  min="0"
                  max="30"
                  updateRate={1000}
                  callBack={stopProgressBar}
                  striped
                />
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {game.categories.map((category) => {
            return (
              <Category
                key={category}
                name={category}
                onAdd={onAdd}
                gameEnded={gameEnded}
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
      {gameEnded && (
        <Redirect
          to={{
            pathname: "/moderation",
            push: true,
            state: {
              gameData: {
                words: words,
              },
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
    //@TODO: when is this executing? which state?
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
