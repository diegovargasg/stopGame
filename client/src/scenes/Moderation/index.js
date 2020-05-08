import _ from "lodash";
import React, { useState, useEffect, useContext } from "react";
import { Redirect } from "react-router-dom";
import { SocketContext } from "../../SocketContext";
import Table from "react-bootstrap/Table";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import ProgressBar from "react-bootstrap/ProgressBar";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

function Moderation(props) {
  const [socket, setSocket] = useContext(SocketContext);
  const [redirect, setRedirect] = useState(false);
  const [activeCat, setActiveCat] = useState(0);

  const [uniqueWords, setUniqueWords] = useState([]);
  const [gameData, setGameData] = useState([
    //_.get(props, "location.state.gameData", {}),

    {
      socketId: "4wT6dgez6LuF7MJdAAAJ",
      words: {
        Names: "Ppp",
        Food: "Ooo",
        Objects: "Test",
        Animals: "",
        Brands: "Tennis",
      },
      name: "vargas",
    },
    {
      socketId: "4wT6dgez6LuF7MJdAAAG",
      words: {
        Names: "papagayo",
        Food: "temp",
        Objects: "otro",
        Animals: "Unomas",
        Brands: "Football",
      },
      name: "camilo",
    },
    {
      socketId: "4wT6dgez6LuF7MJdAATG",
      words: {
        Names: "Fapagayo",
        Food: "temp",
        Objects: "otro",
        Animals: "Unomas",
        Brands: "Football",
      },
      name: "Diego",
    },
  ]);

  const letter = _.get(props, "location.state.letter", "");
  const categories = _.get(props, "location.state.categories", []);
  const userData = _.get(props, "location.state.gameData", {});

  useEffect(() => {
    console.log(gameData);

    /*if (socket === null) {
      props.history.push("/");
      return;
    }*/

    /*socket.emit("userWords", {
      socketId: userData.socketId,
      name: userData.name,
      letter,
      words: userData.words,
    });

    socket.on("otherUserWords", (otherUserData) => {
      console.log(otherUserData);
      setGameData((gameData) => [...gameData, otherUserData]);
    });*/
  }, []);

  /*useEffect(() => {
    if (progressBar > 0 && moderationInProgress) {
      setTimeout(() => {
        setProgressBar(progressBar - 1);
      }, 1000);
    } else if (progressBar <= 0 && moderationInProgress) {
      setActiveCat(activeCat + 1);
    }
  }, [progressBar, moderationInProgress]);*/

  useEffect(() => {
    //console.log(gameData);
  }, [gameData]);

  const isUnique = (word) => {
    if (uniqueWords.includes(word)) {
      return false;
    } else {
      setUniqueWords((uniqueWords) => [...uniqueWords, word]);
      return true;
    }
  };

  const updateCat = () => {
    console.log("updateCat");
    if (activeCat < categories.length) {
      setActiveCat(activeCat + 1);
    } else {
      //Moderation finished
    }
  };

  return (
    <React.Fragment>
      <h5>
        Moderation for the letter{" "}
        <span className="h3">
          <Badge variant="primary">{letter}</Badge>
        </span>
      </h5>
      <Accordion activeKey={activeCat}>
        {categories.map((category, index) => {
          const isActive = activeCat === index;
          return (
            <Card key={index}>
              <Card.Header>
                <h5>{category}</h5>
              </Card.Header>
              <Accordion.Collapse eventKey={index} className="container-fluid">
                <Card.Body>
                  <Category
                    category={category}
                    gameData={gameData}
                    isUnique={isUnique}
                    updateCat={updateCat}
                    isActive={isActive}
                  />
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          );
        })}
      </Accordion>
      {redirect && (
        <Redirect
          to={{
            pathname: "/game",
            push: true,
            state: {},
          }}
        />
      )}
    </React.Fragment>
  );
}

export function Category(props) {
  const category = props.category;
  const gameData = props.gameData;
  const style = { margin: "1rem 0" };
  const [progressBar, setProgressBar] = useState(10);

  useEffect(() => {
    if (progressBar > 0 && props.isActive) {
      setTimeout(() => {
        setProgressBar(progressBar - 1);
      }, 1000);
    } else if (progressBar <= 0 && props.isActive) {
      props.updateCat();
    }
  }, [progressBar, props.isActive]);

  return (
    <Table striped bordered style={style}>
      <thead>
        <tr>
          <th>Player</th>
          <th>Word</th>
          <th>Points</th>
          <th>
            {props.isActive && (
              <ProgressBar
                variant="primary"
                min="0"
                max="10"
                striped
                now={progressBar}
              />
            )}
          </th>
        </tr>
      </thead>
      <tbody>
        {gameData.map((value) => {
          const word = _.get(value, `words.${category}`, "");
          const isValid = _.startsWith(word, props.letter);
          const isUnique = props.isUnique(word);

          let style = {};

          if (!isValid) {
            style = { color: "red" };
          } else if (!isUnique) {
            style = { color: "yellow" };
          } else {
            style = { color: "green" };
          }

          return (
            <tr key={value.socketId}>
              <td>{value.name}</td>
              <td>
                <span style={style}>{word}</span>
              </td>
              <td>0</td>
              <td>
                <Form.Check
                  type="switch"
                  disabled={!isValid}
                  id="custom-switch"
                  label="Approves"
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

export default Moderation;
