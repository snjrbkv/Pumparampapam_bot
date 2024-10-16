import { useEffect, useState } from "react";
import axios from "axios";
import icons from "../assets/icons/icons.jsx";
import "../App.css";
import { Link } from "react-router-dom";
import Navigation from "../components/navigetion.jsx";
const Infl = () => {
  const [userInfo, setUserInfo] = useState({
    username: "",
    user_first_name: "",
    photo_url: icons.profile,
  });

  const [userPhoto, setUserPhoto] = useState(icons.profile);
  const [initData, setInitData] = useState(null);

  useEffect(() => {
    const telegram = window.Telegram?.WebApp;
    if (telegram) {
      telegram.ready();
      const user = telegram.initDataUnsafe?.user;

      if (user) {
        const userData = {
          username: user.username || "username",
          user_first_name: user.first_name || "first_name",
          photo_url: user.photo_url || icons.profile,
        };

        setUserInfo(userData);
        setInitData(telegram.initData); // Set initData when the user is available
      } else {
        console.error("User data is not available.");
      }
    } else {
      console.error(
        "This app must be run inside the Telegram WebApp environment."
      );
    }
  }, []);

  useEffect(() => {
    if (initData) {
      const dataToSend = { initData };

      axios
        .post("https://api.pumparam.ru/api/check-user/", dataToSend, {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        })
        .then((response) => {
          if (response.data.ok) {
            const wallet = response.data?.extra?.WALLET;

            axios
              .post("https://api.pumparam.ru/api/get-user/", dataToSend, {
                headers: {
                  "Content-Type": "application/json; charset=utf-8",
                },
              })
              .then((res) => {
                const userUuid = res.data?.user?.uuid;
                const userPhoto =
                  "https://api.pumparam.ru/" + res.data?.user?.photo;
                const userName = res.data?.user?.username;

                if (userUuid) {
                  localStorage.setItem("userUuid", userUuid);
                  setUserPhoto(userPhoto || icons.profile); // Update user photo
                  setUserInfo((prevState) => ({
                    ...prevState,
                    username: userName,
                  }));
                } else {
                  console.error("UUID not found. Closing WebApp.");
                  window.Telegram.WebApp.close(); // Close app if UUID not found
                }
              })
              .catch((error) => {
                console.error("Error getting user data:", error);
                window.Telegram.WebApp.close(); // Close app on error
              });
          } else if (response.data.error) {
            console.error("Error in data:", response.data.error);
            window.Telegram.WebApp.close(); // Close app if there's an error
          }
        })
        .catch((error) => {
          console.error("Error sending data:", error);
          window.Telegram.WebApp.close(); // Close app on sending data error
        });
    }
  }, [initData]);

  return (
    <div className="infl-in">
      <div className="user-info ">
        <div className="user-img_name">
          <span className="user-profile-img">
            <img
              src={userPhoto}
              alt="User profile"
              onError={(e) => (e.target.src = icons.profile)}
            />
          </span>
          <h3>
            {userInfo.username
              ? `@${userInfo.username}`
              : userInfo.user_first_name}
          </h3>
        </div>

        <Link to="/infl" className="infl">
          <h3>Infl</h3>
          <div className="infl-img">
            <img src={icons.infl} alt="" />
          </div>
        </Link>
      </div>
      <hr />
      <h2 className="infl-title">Comission profit</h2>

      <ul className="infl-box--prosent">
        <li>Influencers</li>
        <li>Liquidity</li>
        <li>Team</li>
        <li>My %</li>
      </ul>

      <div className="wrapper">
        <div className="pie-wrap">
          <div className="sky-blue entry">
            <p>55%</p>
          </div>
          <div className="pink entry">
            <p>10%</p>
          </div>
          <div className="purple entry">
            <p>35%</p>
          </div>
        </div>
      </div>

      <div className="infl-text-box">
        <p>
          Получить долю от прибыли может любой, кто пригласит минимум 0.01% от
          общего числа подтверждённых пользователей при помощи своего канала или
          чата в Telegram. <br /> <br /> Выплаты будут осуществляться до тех
          пор, пока инфлюенсер будет публиковать рекомендованные новости о
          проекте.
        </p>
      </div>
      <Navigation />
    </div>
  );
};

export default Infl;
