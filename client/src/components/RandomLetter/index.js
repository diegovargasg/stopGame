import React, { useState, useEffect } from "react";
import Badge from "react-bootstrap/Badge";
import { getRandomLetter } from "../../utils";

export default (props) => {
  const [counter, setCounter] = useState(props.counter);
  const [letter, setLetter] = useState("");
  const [variant, setVariant] = useState("secondary");

  useEffect(() => {
    if (counter > 0) {
      setTimeout(() => {
        setLetter(getRandomLetter());
        setCounter(counter - 1);
      }, props.speed);
    } else {
      setLetter(props.finalLetter);
      setVariant("primary");
      props.callBack();
    }
  }, [counter]);

  return <Badge variant={variant}>{letter}</Badge>;
};
