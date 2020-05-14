import React, { useState, createContext } from "react";

export const RemotePlayersContext = createContext();

export const RemotePlayersProvider = (props) => {
  const [remotePlayers, setRemotePlayers] = useState({});

  return (
    <RemotePlayersContext.Provider value={[remotePlayers, setRemotePlayers]}>
      {props.children}
    </RemotePlayersContext.Provider>
  );
};
