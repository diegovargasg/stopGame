import _ from "lodash";
import React, { useState, useEffect, useContext, useRef } from "react";
import { Redirect } from "react-router-dom";
import { SocketContext } from "../../SocketContext";
import Table from "react-bootstrap/Table";
import Accordion from "react-bootstrap/Accordion";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import ProgressBar from "react-bootstrap/ProgressBar";
import Form from "react-bootstrap/Form";

function Moderation(props) {
  const [socket, setSocket] = useContext(SocketContext);
  const [redirect, setRedirect] = useState(false);
  const [activeCat, setActiveCat] = useState(0);
  const [wordVotes, setWordVotes] = useState({});
  const [uniqueWords, setUniqueWords] = useState({});
  const [gameData, setGameData] = useState([
    _.get(props, "location.state.gameData", {}),
  ]);

  const letters = _.get(props, "location.state.letters", []);
  const letter = _.get(props, "location.state.letter", "");
  const categories = _.get(props, "location.state.categories", []);
  const userData = _.get(props, "location.state.gameData", {});

  useEffect(() => {
    if (socket === null) {
      props.history.push("/");
      return;
    }

    socket.emit("userWords", {
      socketId: userData.socketId,
      name: userData.name,
      letter,
      words: userData.words,
    });

    socket.on("otherUserWords", (otherUserData) => {
      console.log(otherUserData);
      setGameData((gameData) => [...gameData, otherUserData]);
    });

    socket.on("otherUserVoted", (data) => {
      setWordVotes((wordVotes) => {
        const newVote = _.cloneDeep(wordVotes);
        _.set(newVote, `${data.key}.${data.voter}`, data.vote);
        return newVote;
      });
    });
  }, []);

  useEffect(() => {
    console.log("Game data changed", gameData);
  }, [gameData]);

  useEffect(() => {
    console.log("usersVotes", wordVotes);
  }, [wordVotes]);

  const isUnique = (word) => {
    if (uniqueWords.includes(word)) {
      return false;
    } else {
      setUniqueWords((uniqueWords) => [...uniqueWords, word]);
      return true;
    }
  };

  const updateCat = () => {
    console.log("updateCat", activeCat, categories.length);
    if (activeCat < categories.length - 1) {
      setActiveCat(activeCat + 1);
    } else {
      //Moderation finished
      //setRedirect(true);
    }
  };

  const handleApprove = (socketId, category, activeSocket, vote) => {
    if (socket === null) {
      return;
    }

    setWordVotes((wordVotes) => {
      const newVote = _.cloneDeep(wordVotes);
      _.set(newVote, `${socketId}-${category}.${activeSocket}`, vote);
      return newVote;
    });

    socket.emit("userVotes", {
      key: `${socketId}-${category}`,
      voter: activeSocket,
      vote: vote,
    });
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
                    handleApprove={handleApprove}
                    isActive={isActive}
                    letter={letter}
                    wordVotes={wordVotes}
                    localSocketId={_.get(socket, "id", "")}
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
            state: {
              categories,
              letters,
            },
          }}
        />
      )}
    </React.Fragment>
  );
}

export function Category(props) {
  const tableStyle = { margin: "1rem 0" };
  const [progressBar, setProgressBar] = useState(10);

  useEffect(() => {
    /*if (progressBar > 0 && props.isActive) {
      setTimeout(() => {
        setProgressBar(progressBar - 1);
      }, 1000);
    } else if (progressBar <= 0 && props.isActive) {
      props.updateCat();
    }*/
  }, [progressBar, props.isActive]);

  return (
    <Table striped bordered style={tableStyle}>
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
        {props.gameData.map((value) => {
          const word = _.get(value, `words.${props.category}`, "");
          return (
            <Player
              key={value.socketId}
              socketId={value.socketId}
              name={value.name}
              word={word}
              wordVotes={props.wordVotes}
              category={props.category}
              letter={props.letter}
              handleApprove={props.handleApprove}
              localSocketId={props.localSocketId}
            />
          );
        })}
      </tbody>
    </Table>
  );
}

export function Player(props) {
  useEffect(() => {
    const votesByPlayerCat = _.get(
      props.wordVotes,
      `${props.socketId}-${props.category}`,
      {}
    );

    let yes = 0;
    let no = 0;

    _.forEach(votesByPlayerCat, (vote) => {
      if (vote === 1) {
        yes++;
      } else if (vote === -1) {
        no++;
      }
    });
    setYes(yes);
    setNo(no);
  }, [props.wordVotes]);

  const isValid = _.startsWith(props.word, props.letter);
  //const isUnique = props.isUnique(props.word);

  const [approved, setApproved] = useState();
  const [yes, setYes] = useState(0);
  const [no, setNo] = useState(0);
  const handleApprove = (vote) => {
    setApproved(vote);
    props.handleApprove(
      props.socketId,
      props.category,
      props.localSocketId,
      vote
    );
  };

  return (
    <tr>
      <td>{props.name}</td>
      <td>
        <span>
          {props.word}{" "}
          {yes > 0 && (
            <Badge pill variant="success">
              {yes}
            </Badge>
          )}
          {no > 0 && (
            <Badge pill variant="danger">
              {no}
            </Badge>
          )}
        </span>
      </td>
      <td>0</td>
      <td>
        {props.socketId !== props.localSocketId && (
          <ToggleButtonGroup
            type="radio"
            value={approved}
            name={`${props.socketId}-${props.category}`}
            onChange={handleApprove}
          >
            <ToggleButton
              variant={approved === 1 ? "primary" : "secondary"}
              value={1}
              disabled={!isValid}
            >
              Yes
            </ToggleButton>
            <ToggleButton
              variant={approved === -1 ? "primary" : "secondary"}
              value={-1}
              disabled={!isValid}
            >
              No
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </td>
    </tr>
  );
}

export default Moderation;
