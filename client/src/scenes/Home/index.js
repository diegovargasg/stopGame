import React, { useState, useEffect, useContext } from "react";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import CreateGame from "../../scenes/CreateGame";
import JoinGame from "../../scenes/JoinGame";
import { LocalPlayerContext } from "../../LocalPlayerContext";
import { RemotePlayersContext } from "../../RemotePlayersContext";
import { GameContext } from "../../GameContext";
import Constants from "../../constants";

function Home() {
  const [key, setKey] = useState("create");
  const [game, setGame] = useContext(GameContext);
  const [remotePlayers, setRemotePlayers] = useContext(RemotePlayersContext);
  const [localPlayer, setLocalPlayer] = useContext(LocalPlayerContext);
  const tabStyle = { margin: "1rem 0" };

  useEffect(() => {
    setLocalPlayer(Constants.localPlayerDefault);
    setRemotePlayers(Constants.remotePlayersDefault);
    setGame(Constants.gameDefault);
  }, []);

  return (
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
  );
}

export default Home;
