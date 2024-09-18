import React from "react";
import images from "../images/images";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Third() {
  const [isPageShown, setIsPageShown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const thirdVisited = localStorage.getItem("thirdVisited");
    if (thirdVisited) {
      navigate("/home");
    } else {
      setIsPageShown(true);
    }
  }, [navigate]);

  useEffect(() => {
    if (isPageShown) {
      localStorage.setItem("thirdVisited", "true");
    }
  }, [isPageShown]);

  if (!isPageShown) return null;
  return (
    <div className="carusel-in">
      <img className="carusel-in__img" src={images.Model} alt="" />
      <div className="carusel-info">
        <h2>
          We have an online user <br /> counter installed
        </h2>
        <p>
          In order to link a wallet, you only need to invite 3 friends, who in
          turn will invite 3 more friends or pay for a 1 TON boost. Everything
          is as simple as possible!
        </p>
        <Link className="carusel-info__btn" to="/home">
          Start
        </Link>
      </div>
    </div>
  );
}

export default Third;
