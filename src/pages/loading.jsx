import icons from "../assets/icons/icons.jsx";

const loading = () => {
  return (
    <div className="loading-in">
      <img className="loading-img" src={icons.ghf} alt="loading" />
      <h1 className="loading-title">
        Pumparam <br /> Airdrop
      </h1>
    </div>
  );
};

export default loading;
