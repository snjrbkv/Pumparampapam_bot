import React, { useState, useEffect } from "react";
import axios from "axios";
import StarBtnModal from "../components/starBtn";
import Navigation from "../components/navigetion";
import "../App.css";
import Images from "../images/images";
import icons from "../icons/icons";

const Friends = () => {
  const [showModal, setShowModal] = useState(false); // Состояние для отображения модала
  const [referals, setReferals] = useState([]); // Состояние для хранения данных
  const [initData, setInitData] = useState(null); // Состояние для хранения initData
  // const [userPhoto, setUserPhoto] = useState(icons.profile);
  const [referralLink, setReferralLink] = useState(""); // Состояние для хранения реферальной ссылки

  useEffect(() => {
    const telegram = window.Telegram?.WebApp;
    if (telegram) {
      telegram.ready();
      const user = telegram.initDataUnsafe?.user;

      if (user) {
        setInitData(telegram.initData); // Сохраняем initData для последующей отправки
      } else {
        console.error("User data is not available.");
      }
    } else {
      console.error(
        "This app must be run inside the Telegram WebApp environment."
      );
    }
  }, []);

  // Запрос на получение рефералов с использованием initData и userUuid
  useEffect(() => {
    const fetchReferals = async () => {
      try {
        if (!initData) {
          console.error("InitData is not available.");
          return;
        }

        const userUuid = localStorage.getItem("userUuid"); // Получаем userUuid из локального хранилища
        const dataToSend = {
          initData, // Отправляем initData
          userUuid, // Отправляем userUuid для идентификации пользователя
        };

        if (userUuid) {
          const response = await axios.post(
            `https://api.bot-dev.uz/api/get-referrals/${userUuid}`,
            dataToSend, // Отправляем initData и userUuid
            {
              headers: {
                "Content-Type": "application/json; charset=utf-8",
              },
            }
          );

          if (response.data && Array.isArray(response.data.referrals)) {
            setReferals(response.data.referrals);
          } else {
            setReferals([]); // Если данных нет, устанавливаем пустой массив
          }

          setReferralLink(response.data?.referral_link || ""); // Сохраняем реферальную ссылку
        }
      } catch (error) {
        console.error("Error fetching referals:", error);
      }
    };

    fetchReferals(); // Вызываем функцию получения данных
  }, [initData]);

  // Функция копирования ссылки в буфер обмена
  const handleCopyLink = () => {
    if (referralLink) {
      navigator.clipboard
        .writeText(referralLink)
        .then(() => {
          alert("Referral link copied to clipboard!");
        })
        .catch((error) => {
          console.error("Error copying link: ", error);
        });
    } else {
      console.error("Referral link is not available.");
    }
  };

  // Функция для открытия окна пересылки
  const handleSendLink = () => {
    const telegram = window.Telegram?.WebApp;
    if (referralLink && telegram) {
      telegram.openLink(
        "https://t.me/share/url?url=" + encodeURIComponent(referralLink)
      );
    } else {
      console.error("Referral link or Telegram API is not available.");
    }
  };

  const handleShow = () => setShowModal(true); // Открыть модал
  const handleClose = () => setShowModal(false); // Закрыть модал

  return (
    <div className="friends-in">
      {referals.length !== 0 && (
        <div>
          <h1 className="friend-h1">A list of your friends</h1>
          <p className="friend-p">
            The icon marks friends who have fulfilled the conditions and
            connected the wallet
          </p>
        </div>
      )}

      <hr />

      <StarBtnModal className="friend-star-btn" />

      <hr />

      {referals.length === 0 && (
        <h2>
          You haven't invited any <br /> friends yet
        </h2>
      )}
      {referals.length === 0 && (
        <p>
          In order to link a wallet, you need to invite 3 friends, who in turn
          will invite 3 of their <br /> friends or pay for a 1 TON boost.
        </p>
      )}
      {referals.length === 0 && (
        <img src={Images.friendsBg} alt="" className="friends-img" />
      )}
      {/* Отображаем полученные рефералы */}
      {referals && referals.length > 0 ? (
        <ul className="friend-list">
          {referals.map((user, index) => (
            <React.Fragment key={index}>
              <li className="friend-list--item w-100">
                <div className="friend-info w-100">
                  <span className="friend-img">
                    <img
                      src={
                        user.photo
                          ? `https://api.bot-dev.uz/${user.photo}`
                          : icons.profile
                      }
                      className="w-100"
                      alt="user"
                    />
                  </span>
                  <div className="friend-text">
                    <p className="friend-title">
                      {user.username || user.first_name}
                    </p>
                  </div>
                </div>
              </li>

              {/* Вложенные рефералы */}
              {user.referrals &&
                user.referrals.length > 0 &&
                user.referrals.map((subUser, subIndex) => (
                  <li className="friend-list--item w-100" key={subIndex}>
                    <div className="friend-info w-100">
                      <span className="friend-img">
                        <img
                          src={
                            subUser.photo
                              ? `https://api.bot-dev.uz/${subUser.photo}`
                              : icons.profile
                          }
                          className="w-100"
                          alt="user"
                        />
                      </span>
                      <div className="friend-text">
                        <p className="friend-title">
                          {subUser.username || subUser.first_name}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
            </React.Fragment>
          ))}
        </ul>
      ) : null}

      {/* Кнопка для открытия модала */}
      {referals.length <= 3 && (
        <div className="green-btn friends-btn" onClick={handleShow}>
          Invite friends
        </div>
      )}

      {referals.length >= 3 && (
        <div className="green-btn friends-btn">Connect wallet</div>
      )}

      {/* Модальное окно */}
      {showModal && (
        <div className="custom-modal-overlay " onClick={handleClose}>
          <div
            className="custom-modal-content "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="custom-modal-header">
              <h3>Invite friends</h3>
              <button className="custom-close-btn" onClick={handleClose}>
                &times;
              </button>
            </div>
            <hr />
            <div className="custom-modal-body">
              <button className="custom-invite-btn" onClick={handleCopyLink}>
                <img src={icons.copy} alt="" /> Copy the link
              </button>
              <button className="custom-invite-btn" onClick={handleSendLink}>
                <img src={icons.send} alt="" /> Send a link
              </button>
            </div>
          </div>
        </div>
      )}

      <Navigation />
    </div>
  );
};

export default Friends;
