import React, { useState, useEffect } from "react";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import CreateGame from "../../scenes/CreateGame";
import JoinGame from "../../scenes/JoinGame";

function Home() {
  const [key, setKey] = useState("create");

  useEffect(() => {}, []);

  return (
    <Tabs
      id="controlled-tab-example"
      activeKey={key}
      transition={false}
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
