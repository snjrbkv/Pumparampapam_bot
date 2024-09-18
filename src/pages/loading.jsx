import React from "react";
import icons from "../icons/icons";

const loading = () => {
  return (
    <div className="loading-in">
      <img className="loading-img" src={icons.loadingImg} alt="loading" />
      <h1 className="loading-title">
        Pumparam <br /> Airdrop
      </h1>
    </div>
  );
};

export default loading;
