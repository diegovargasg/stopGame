import React, { useState, createContext } from "react";
import Constants from "./constants";

export const GameContext = createContext();

export const GameProvider = (props) => {
  const [game, setGame] = useState(Constants.gameDefault);

  return (
    <GameContext.Provider value={[game, setGame]}>
      {props.children}
    </GameContext.Provider>
  );
};
