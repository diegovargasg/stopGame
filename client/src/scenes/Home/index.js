import _ from "lodash";
import React, { useState, useEffect, useContext } from "react";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import CreateGame from "../../scenes/CreateGame";
import JoinGame from "../../scenes/JoinGame";
import { LocalPlayerContext } from "../../LocalPlayerContext";
import { RemotePlayersContext } from "../../RemotePlayersContext";
import { GameContext } from "../../GameContext";
import Constants from "../../constants";
import Alert from "react-bootstrap/Alert";

function Home(props) {
  const [key, setKey] = useState("create");
  const [game, setGame] = useContext(GameContext);
  const [remotePlayers, setRemotePlayers] = useContext(RemotePlayersContext);
  const [localPlayer, setLocalPlayer] = useContext(LocalPlayerContext);
  const [showError, setShowError] = useState(false);
  const tabStyle = { margin: "1rem 0" };

  useEffect(() => {
    setLocalPlayer(Constants.localPlayerDefault);
    setRemotePlayers(Constants.remotePlayersDefault);
    setGame(Constants.gameDefault);
    if (_.get(props, "location.state.error", false)) {
      setShowError(true);
    }
  }, []);

  return (
    <React.Fragment>
      {showError && (
        <Alert
          variant="danger"
          onClose={() => {
            setShowError(false);
          }}
          dismissible
        >
          {props.location.state.error}
        </Alert>
      )}
      <Tabs
        id="controlled-tab-example"
        activeKey={key}
        transition={false}
        style={tabStyle}
        onSelect={(k) => setKey(k)}
      >
        <Tab eventKey="create" title="Create Game">
          <CreateGame />
        </Tab>
        <Tab eventKey="join" title="Join Game">
          <JoinGame />
        </Tab>
      </Tabs>
    </React.Fragment>
  );
}

export default Home;
