import _ from "lodash";
import React, { useState, useEffect, useContext } from "react";
import { Redirect } from "react-router-dom";
import { SocketContext } from "../../SocketContext";
import Table from "react-bootstrap/Table";
import Accordion from "react-bootstrap/Accordion";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Alert from "react-bootstrap/Alert";
import Form from "react-bootstrap/Form";
import ProgressBar from "../../components/ProgressBar";
import { RemotePlayersContext } from "../../RemotePlayersContext";
import { GameContext } from "../../GameContext";
import { LocalPlayerContext } from "../../LocalPlayerContext";

function Moderation(props) {
  const [game, setGame] = useContext(GameContext);
  const [socket, setSocket] = useContext(SocketContext);
  const [localPlayer, setLocalPlayer] = useContext(LocalPlayerContext);
  const [remotePlayers, setRemotePlayers] = useContext(RemotePlayersContext);
  const [letter, setLetter] = useState();
  const [redirect, setRedirect] = useState(false);
  const [activeCat, setActiveCat] = useState(0);
  const [wordVotes, setWordVotes] = useState({});
  const [gameData, setGameData] = useState({});

  const localPlayerGameData = _.get(props, "location.state.gameData", {});

  useEffect(() => {
    socket.emit("userWords", {
      playerId: localPlayer.id,
      name: localPlayer.name,
      words: localPlayerGameData.words,
    });
  }, [gameData]);

  useEffect(() => {
    if (socket === null || game.id === "") {
      props.history.push("/");
      return;
    }

    const currentLetter = game.letters[game.currentRound];
    setLetter(currentLetter);

    setGameData((gameData) => {
      const newGameData = _.cloneDeep(gameData);
      _.set(newGameData, `${localPlayer.id}-${currentLetter}`, {
        playerId: localPlayer.id,
        name: localPlayer.name,
        words: localPlayerGameData.words,
      });
      return newGameData;
    });

    socket.on("otherUserWords", (otherUserData) => {
      setGameData((gameData) => {
        const newGameData = _.cloneDeep(gameData);
        _.set(newGameData, `${otherUserData.playerId}-${currentLetter}`, {
          playerId: otherUserData.playerId,
          name: otherUserData.name,
          words: otherUserData.words,
        });
        return newGameData;
      });
    });

    socket.on("otherUserVoted", (data) => {
      setWordVotes((wordVotes) => {
        const newVote = _.cloneDeep(wordVotes);
        _.set(newVote, `${data.id}.${data.category}.${data.voter}`, data.vote);
        return newVote;
      });
    });

    socket.on("moderationEnded", (data) => {
      const currentRound = game.currentRound + 1;
      setGame((game) => ({ ...game, currentRound: currentRound }));
      setRedirect(data);
    });
  }, []);

  useEffect(() => {
    const minNumVotes = (_.size(remotePlayers) + 1) * _.size(remotePlayers);
    const nameActiveCat = game.categories[activeCat];
    let numVotesByCat = 0;

    _.map(wordVotes, (player) => {
      const votesActiveCat = _.get(player, `${nameActiveCat}`, {});
      numVotesByCat += _.size(votesActiveCat);
    });

    if (numVotesByCat >= minNumVotes) {
      console.log("all players voted", numVotesByCat, minNumVotes);
      _.delay(updateCat, 2000);
    }
  }, [wordVotes]);

  const updateCat = () => {
    if (activeCat < game.categories.length - 1) {
      setActiveCat(activeCat + 1);
    } else {
      //Moderation finished
      socket.emit("moderationEnded", true);
    }
  };

  const handleVote = (id, category, vote) => {
    if (socket === null) {
      return;
    }
    setWordVotes((wordVotes) => {
      const newVote = _.cloneDeep(wordVotes);
      _.set(newVote, `${id}.${category}.${localPlayer.id}`, vote);
      return newVote;
    });

    socket.emit("userVotes", {
      id,
      category,
      voter: localPlayer.id,
      vote,
    });
  };

  const styleCardBody = { padding: 0 };
  const infoStyle = { "font-size": "0.8rem" };
  const categoryStyle = { "margin-bottom": 0 };

  return (
    <React.Fragment>
      <h5>
        Moderation for the letter{" "}
        <span className="h4">
          <Badge variant="primary">{letter}</Badge>
        </span>
      </h5>
      <Accordion activeKey={activeCat}>
        {game.categories.map((category, index) => {
          const isActive = activeCat === index;
          return (
            <Card key={index}>
              <Card.Header>
                <h6 style={categoryStyle}>{category}</h6>
              </Card.Header>
              <Accordion.Collapse eventKey={index} className="container-fluid">
                <Card.Body style={styleCardBody}>
                  <Category
                    category={category}
                    gameData={gameData}
                    updateCat={updateCat}
                    handleVote={handleVote}
                    isActive={isActive}
                    letter={letter}
                    wordVotes={wordVotes}
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
            pathname: "/results",
            push: true,
            state: {},
          }}
        />
      )}
    </React.Fragment>
  );
}

export function Category(props) {
  const tableStyle = { margin: "1.5rem 0" };
  const [allWords, setAllWords] = useState([]);
  const [localPlayer, setLocalPlayer] = useContext(LocalPlayerContext);
  const [remotePlayers, setRemotePlayers] = useContext(RemotePlayersContext);

  //@TODO: Fix this unique detection, is very ugly
  const isUnique = (word) => {
    let cont = 0;
    _.map(allWords, (playedWord) => {
      if (playedWord === word) {
        cont++;
      }
    });
    return cont > 1 ? false : true;
  };

  useEffect(() => {
    const allWords = [];
    _.map(props.gameData, (value) => {
      const word = _.get(value, `words.${props.category}`, "");
      allWords.push(word);
    });
    setAllWords(allWords);
  }, [props.gameData]);

  return (
    <Table striped bordered style={tableStyle} size="sm">
      <thead>
        <tr>
          <th>Player</th>
          <th>Word</th>
          <th>Pts</th>
          <th>
            {props.isActive && (
              <ProgressBar
                variant="primary"
                min={0}
                max={10}
                now={10}
                updateRate={1000}
                callBack={props.updateCat}
                striped
              />
            )}
          </th>
        </tr>
      </thead>
      <tbody>
        {_.map(props.gameData, (value) => {
          const word = _.get(value, `words.${props.category}`, "");

          if (_.isEmpty(word)) {
            return <PlayerEmpty key={value.playerId} name={value.name} />;
          }

          const votesByPlayerCat = _.get(
            props.wordVotes,
            `${value.playerId}.${props.category}`,
            {}
          );

          const unique = isUnique(word);
          let yes = 0;
          let no = 0;
          _.forEach(votesByPlayerCat, (vote) => {
            vote ? yes++ : no++;
            /* if (vote) {
              yes++;
            } else {
              no++;
            } */
          });
          const points = yes > no ? (unique ? 1 : 0.5) : 0;
          const enableVote = value.playerId === localPlayer.id ? false : true;

          return (
            <Player
              key={value.playerId}
              id={value.playerId}
              name={value.name}
              word={word}
              wordVotes={props.wordVotes}
              category={props.category}
              letter={props.letter}
              isUnique={unique}
              yes={yes}
              no={no}
              points={points}
              handleVote={props.handleVote}
              enableVote={enableVote}
            />
          );
        })}
      </tbody>
    </Table>
  );
}

export function Player(props) {
  const [approved, setApproved] = useState(false);
  const [localPlayer, setLocalPlayer] = useContext(LocalPlayerContext);
  const [remotePlayers, setRemotePlayers] = useContext(RemotePlayersContext);

  //Should we implement any sor of validation for the words?
  //const isValid = _.startsWith(props.word, props.letter);
  const isValid = true;

  const handleVote = (vote) => {
    setApproved(vote.currentTarget.checked);
    props.handleVote(props.id, props.category, vote.currentTarget.checked);
  };

  useEffect(() => {
    if (props.id === localPlayer.id) {
      setLocalPlayer((setLocalPlayer) => {
        const newLocalPlayer = _.cloneDeep(localPlayer);
        _.set(
          newLocalPlayer,
          `points.${props.letter}.${props.category}`,
          props.points
        );
        return newLocalPlayer;
      });
    } else {
      setRemotePlayers((remotePlayers) => {
        const newRemotePlayers = _.cloneDeep(remotePlayers);
        const newPlayerIndex = _.findIndex(newRemotePlayers, (player) => {
          return player.id === props.id;
        });
        _.set(
          newRemotePlayers,
          `${newPlayerIndex}.points.${props.letter}.${props.category}`,
          props.points
        );
        return newRemotePlayers;
      });
    }
  }, [props.points]);

  return (
    <tr>
      <td>{props.name}</td>
      <td>
        <span>
          {_.isEmpty(props.word) ? "-" : _.unescape(props.word)}{" "}
          {props.yes > 0 && (
            <Badge pill variant="success">
              {props.yes}
            </Badge>
          )}
          {props.no > 0 && (
            <Badge pill variant="danger">
              {props.no}
            </Badge>
          )}
        </span>
      </td>
      <td align="center">{props.points}</td>
      <td align="center">
        {props.enableVote && (
          <Form>
            <Form.Check
              type="switch"
              id={`${props.id}-${props.category}`}
              onChange={handleVote}
              checked={approved}
              label="Accept"
              inline
            />
          </Form>
        )}
      </td>
    </tr>
  );
}

export function PlayerEmpty(props) {
  return (
    <tr>
      <td>{props.name}</td>
      <td align="center">-</td>
      <td align="center">0</td>
      <td></td>
    </tr>
  );
}

export default Moderation;
