import React, { useState, useEffect } from "react";
import ProgressBar from "react-bootstrap/ProgressBar";

export default (props) => {
  const [now, setNow] = useState(props.max);

  useEffect(() => {
    if (now > 0) {
      setTimeout(() => {
        setNow(now - 1);
      }, props.updateRate);
    } else {
      props.callBack();
    }
  }, [now]);

  return (
    <ProgressBar
      variant={props.variant}
      min={props.min}
      max={props.max}
      now={now}
      striped
    />
  );
};
