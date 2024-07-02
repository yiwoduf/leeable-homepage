import React from "react";
import Lottie from "react-lottie-player";

import lottieJson from "/public/animation.json";

const Animation = () => {
  return (
    <Lottie
      loop
      animationData={lottieJson}
      play
      style={{ width: `100%`, height: `100%` }}
    />
  );
};

export default Animation;
