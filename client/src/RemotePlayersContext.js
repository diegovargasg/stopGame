import React, { useState, createContext } from "react";
import Constants from "./constants";

export const RemotePlayersContext = createContext();

export const RemotePlayersProvider = (props) => {
  /* const defaultRemote = [
    {
      id: "1234562",
      gameId: "131",
      name: "Camilo",
      ready: true,
      points: {
        L: { Colors: 1, Brands: 1, Animals: 0 },
        V: { Colors: 0, Brands: 1, Animals: 0 },
      },
    },
    {
      id: "1234568",
      gameId: "131",
      name: "Vargas",
      ready: true,
      points: {
        L: { Colors: 1, Brands: 0, Animals: 0 },
        V: { Colors: 0, Brands: 0, Animals: 0 },
      },
    },
  ]; */
  //const [remotePlayers, setRemotePlayers] = useState(defaultRemote);
  const [remotePlayers, setRemotePlayers] = useState(
    Constants.remotePlayersDefault
  );

  return (
    <RemotePlayersContext.Provider value={[remotePlayers, setRemotePlayers]}>
      {props.children}
    </RemotePlayersContext.Provider>
  );
};
