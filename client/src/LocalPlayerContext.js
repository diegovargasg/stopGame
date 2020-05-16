import React, { useState, createContext } from "react";
import Constants from "./constants";

export const LocalPlayerContext = createContext();

export const LocalPlayerProvider = (props) => {
  const [localPlayer, setLocalPlayer] = useState(Constants.localPlayerDefault);

  return (
    <LocalPlayerContext.Provider value={[localPlayer, setLocalPlayer]}>
      {props.children}
    </LocalPlayerContext.Provider>
  );
};
