import React from "react";
import images from "../images/images";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function First() {
  const [isPageShown, setIsPageShown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const firstVisited = localStorage.getItem("firstVisited");
    if (firstVisited) {
      navigate("/home");
    } else {
      setIsPageShown(true);
    }
  }, [navigate]);

  useEffect(() => {
    if (isPageShown) {
      localStorage.setItem("firstVisited", "true");
    }
  }, [isPageShown]);

  if (!isPageShown) return null;
  return (
    <div className="carusel-in">
      <img className="carusel-in__img" src={images.Model} alt="" />
      <div className="carusel-info">
        <h2>
          Meet the first <br /> fair airdrop!
        </h2>
        <p>
          No need to play, tap, click, log in every three hours, and so on!
          Everyone will receive an equal number of tokens. To receive a drop,
          you only need to link a wallet.
        </p>
        <Link className="carusel-info__btn" to="/second">
          Next
        </Link>
      </div>
    </div>
  );
}

export default First;
