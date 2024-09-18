import React, { useEffect, useState } from "react";
import axios from "axios";
import icons from "../icons/icons";
import Navigation from "../components/navigetion";
import "../App.css";
import { Link } from "react-router-dom";

const Home = () => {
  const [userInfo, setUserInfo] = useState({
    username: "",
    photo_url: icons.profile,
  });

  const [userPhoto, setUserPhoto] = useState(icons.profile);
  const [initData, setInitData] = useState(null);

  useEffect(() => {
    console.log("useEffect triggered");

    const telegram = window.Telegram?.WebApp;
    if (telegram) {
      telegram.ready();
      const user = telegram.initDataUnsafe?.user;

      if (user) {
        console.log("Telegram user data:", user);

        const userData = {
          username: user.username || "username",
          user_first_name: user.first_name || "first_name",
          photo_url: user.photo_url || icons.profile,
        };

        setUserInfo(userData);
        setInitData(telegram.initData);
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
        .post("https://api.bot-dev.uz/api/check-user/", dataToSend, {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        })
        .then((response) => {
          console.log("Server response:", response.data);

          if (response.data.ok) {
            console.log("Data is ok");

            axios
              .post("https://api.bot-dev.uz/api/get-user/", dataToSend, {
                headers: {
                  "Content-Type": "application/json; charset=utf-8",
                },
              })
              .then((res) => {
                const userUuid = res.data?.user?.uuid;
                const userPhoto =
                  "https://api.bot-dev.uz/" + res.data?.user?.photo;
                const userName = res.data?.user?.username;

                if (userUuid) {
                  localStorage.setItem("userUuid", userUuid);
                  console.log("UUID saved:", userUuid);

                  // Обновляем фото пользователя
                  setUserPhoto(userPhoto || icons.profile);
                  setUserInfo((prevState) => ({
                    ...prevState,
                    username: userName,
                  }));
                } else {
                  console.error("UUID not found. Closing WebApp.");
                  window.Telegram.WebApp.close(); // Закрыть приложение, если UUID не найден
                }
              })
              .catch((error) => {
                console.error("Error getting user data:", error);
                window.Telegram.WebApp.close(); // Закрыть приложение при ошибке
              });
          } else if (response.data.error) {
            console.error("Error in data:", response.data.error);
            window.Telegram.WebApp.close(); // Закрыть приложение при ошибке в данных
          }
        })
        .catch((error) => {
          console.error("Error sending data:", error);
          window.Telegram.WebApp.close(); // Закрыть приложение при ошибке отправки данных
        });
    }
  }, [initData]);

  return (
    <div className="home-in">
      <div className="user-info">
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
      <div className="home-tokens">
        <img className="home-img" src={icons.loadingImg} alt="Loading" />
        <h2>100.000 PUMP</h2>
      </div>
      <Link to="/friends" className="green-btn text-decoration-none">
        Claim
      </Link>
      <Navigation />
    </div>
  );
};

export default Home;
