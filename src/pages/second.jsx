import images from "../assets/images/images.jsx";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Second() {
  const [isPageShown, setIsPageShown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const secondVisited = localStorage.getItem("secondVisited");
    if (secondVisited) {
      navigate("/home");
    } else {
      setIsPageShown(true);
    }
  }, [navigate]);

  useEffect(() => {
    if (isPageShown) {
      localStorage.setItem("secondVisited", "true");
    }
  }, [isPageShown]);

  if (!isPageShown) return null;

  return (
    <div className="carusel-in">
      <img className="carusel-in__img" src={images.Model} alt="" />
      <div className="carusel-info">
        <h2>
          The goal of the game <br /> is just to link a wallet
        </h2>
        <p>
          You are not required to spend time in the app, as many similar games
          ask you to do. Just link your wallet to our bot and get a drop.
        </p>

        <Link className="carusel-info__btn" to="/third">
          Next
        </Link>
      </div>
    </div>
  );
}

export default Second;
