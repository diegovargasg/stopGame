import React, { useState, createContext } from "react";

export const LocalPlayerContext = createContext();

export const LocalPlayerProvider = (props) => {
  const localPlayerDefault = {
    id: "",
    gameId: "",
    name: "",
    ready: "",
    points: 0,
  };
  const [localPlayer, setLocalPlayer] = useState(localPlayerDefault);

  return (
    <LocalPlayerContext.Provider value={[localPlayer, setLocalPlayer]}>
      {props.children}
    </LocalPlayerContext.Provider>
  );
};
