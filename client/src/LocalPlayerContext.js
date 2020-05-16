import React, { useState, createContext } from "react";

export const LocalPlayerContext = createContext();

export const LocalPlayerProvider = (props) => {
  const localPlayerDefault = {
    id: "",
    gameId: "",
    name: "",
    ready: "",
    points: {},
  };
  /* const localPlayerDefault = {
    id: "1234567",
    gameId: "131",
    name: "Diego",
    ready: true,
    points: {
      L: { Colors: 1, Brands: 1, Animals: 0 },
      V: { Colors: 0, Brands: 1, Animals: 0 },
    },
  }; */
  const [localPlayer, setLocalPlayer] = useState(localPlayerDefault);

  return (
    <LocalPlayerContext.Provider value={[localPlayer, setLocalPlayer]}>
      {props.children}
    </LocalPlayerContext.Provider>
  );
};
