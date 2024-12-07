import React from "react";

const Like = props => {
  let classes = "fa fa-lg fa-star";
  if (!props.liked) classes += "-o";

  return (
    <i
      onClick={props.onClick}
      style={{ cursor: "pointer" , color: "#d4af47"}}
      className={classes}
      aria-hidden="true"
    />
  );
};

export default Like;
