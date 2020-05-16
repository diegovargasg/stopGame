import React, { useState, createContext } from "react";

export const GameContext = createContext();

export const GameProvider = (props) => {
  const gameDefault = {
    id: "",
    categories: [],
    rounds: 0,
    letters: [],
    //letters: ["L", "V"],
    scores: {},
    currentRound: 0,
  };
  const [game, setGame] = useState(gameDefault);

  return (
    <GameContext.Provider value={[game, setGame]}>
      {props.children}
    </GameContext.Provider>
  );
};
