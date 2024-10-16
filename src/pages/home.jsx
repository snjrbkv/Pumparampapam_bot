import { useEffect, useState } from "react";
import axios from "axios";
import icons from "../assets/icons/icons.jsx";
import Navigation from "../components/navigetion.jsx";
import "../App.css";
import { Link } from "react-router-dom";
import images from "../assets/images/images.jsx";
const Home = () => {
  const [userInfo, setUserInfo] = useState({
    username: "",
    photo_url: icons.profile,
  });

  const [userPhoto, setUserPhoto] = useState(icons.profile);
  const [initData, setInitData] = useState(null);

  // SWC: Move initData effect to only run when the component is mounted
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

  // SWC: Store TON_FOR_TASK and TON_FOR_REFERRAL from API response into localStorage
  useEffect(() => {
    // clear localStorage everything
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
            const boost = response.data?.extra?.BOOST;

            if (boost) {
              localStorage.setItem("TON_FOR_TASK", boost.TON_FOR_TASK);
              localStorage.setItem("TON_FOR_REFERRAL", boost.TON_FOR_REFERRAL);
              localStorage.setItem(
                "TOTAL_DAY_FOR_TASK",
                boost.TOTAL_DAY_FOR_TASK
              );
              localStorage.setItem("TO_WALLET", wallet);
            }

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
    <div className="home-in">
      <div className="user-info">
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
      <div className="home-tokens">
        <img className="home-img" src={images.gif} alt="Loading" />
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
