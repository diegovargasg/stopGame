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
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

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

    const defaultCat = {};
    game.categories.map((category) => {
      _.set(defaultCat, `${category}`, "");
    });

    setWords(defaultCat);
    setFinalLetter(game.letters[game.currentRound]);

    return () => {
      //onUnmount do clean-up events here
      socket.off("gameEnded");
    };
  }, []);

  const randomLetterEnded = () => {
    setGameStarted(true);
    setShowBegin(true);
  };

  const stopProgressBar = () => {
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

  const tableStyle = { marginTop: "1.5rem" };

  return (
    <React.Fragment>
      <h5>
        Words beginning with{" "}
        {finalLetter && (
          <span className="h4" ref={letterBadge}>
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
      <Table style={tableStyle} striped bordered size="sm">
        <thead>
          <tr>
            <th>Category</th>
            <th>
              <Row>
                <Col>Word</Col>
                <Col>
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
                </Col>
              </Row>
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
  const input = useRef(null);

  const handleChange = () => {
    const word = _.upperFirst(
      _.truncate(_.trim(_.escape(input.current.value)), {
        length: 24,
      })
    );
    //stores the word
    props.onAdd(props.name, word);
  };

  return (
    <tr key={props.name}>
      <td>{props.name}</td>
      <td>
        <Form.Control
          type="text"
          ref={input}
          maxLength={24}
          onChange={handleChange}
        />
      </td>
    </tr>
  );
}

export default Game;
