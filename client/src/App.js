import React from "react";
import Home from "./scenes/Home/";
import Game from "./scenes/Game/";
import Waiting from "./scenes/Waiting/";
import Moderation from "./scenes/Moderation/";
import Results from "./scenes/Results/";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { createBrowserHistory } from "history";
import Container from "react-bootstrap/Container";
import { RemotePlayersProvider } from "./RemotePlayersContext";
import { SocketProvider } from "./SocketContext";
import { GameProvider } from "./GameContext";
import { LocalPlayerProvider } from "./LocalPlayerContext";

function App() {
  const history = createBrowserHistory();
  const style = { margin: "15px 0" };

  return (
    <div className="App">
      <Container fluid style={style}>
        <SocketProvider>
          <GameProvider>
            <LocalPlayerProvider>
              <RemotePlayersProvider>
                <Router history={history}>
                  <Switch>
                    <Route path="/" exact component={Home} />
                    <Route path="/waiting" component={Waiting} />
                    <Route path="/moderation" component={Moderation} />
                    <Route path="/results" component={Results} />
                    <Route path="/game" component={Game} />
                  </Switch>
                </Router>
              </RemotePlayersProvider>
            </LocalPlayerProvider>
          </GameProvider>
        </SocketProvider>
      </Container>
    </div>
  );
}

export default App;
