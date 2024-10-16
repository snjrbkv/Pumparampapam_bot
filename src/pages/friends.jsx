import React, { useState, useEffect } from "react";
import axios from "axios";
import ModalFriends from "../components/ModalFriends.jsx";
import Navigation from "../components/navigetion.jsx";
import "../App.css";
import Images from "../assets/images/images.jsx";
import icons from "../assets/icons/icons.jsx";
import {
  TonConnectButton,
  useTonConnectUI,
  useTonWallet,
  useTonAddress,
} from "@tonconnect/ui-react";
import { Display } from "react-bootstrap-icons";

const Friends = () => {
  const [showModal, setShowModal] = useState(false); // Состояние для отображения модала
  const [referals, setReferals] = useState([]); // Состояние для хранения данных
  const [initData, setInitData] = useState(null); // Состояние для хранения initData
  const [expandedUserIndex, setExpandedUserIndex] = useState(null); // Для отслеживания, какой друг раскрыт
  const [referralLink, setReferralLink] = useState(""); // Состояние для хранения реферальной ссылки
  const [walletEligible, setWalletEligible] = useState(false); // Состояние для отображения кнопки подключения кошелька
  const [boosted, setBoosted] = useState({});
  const [tonConnectUi] = useTonConnectUI();
  const userFriendlyAddress = useTonAddress();
  const wallet = useTonWallet();


  useEffect(() => {
    const telegram = window.Telegram?.WebApp;
    if (telegram) {
      telegram.ready();
      const user = telegram.initDataUnsafe?.user;
      if (user) {
        setInitData(telegram.initData); // Сохраняем initData для последующей отправки
        const getUserData = async () => {
          await axios
            .post("https://api.pumparam.ru/api/get-user/", 
              {initData: telegram.initData},
              {headers: {
                "Content-Type": "application/json; charset=utf-8",
              },
            })
            .then((res) => {
              setBoosted(res.data?.boosted);
            })
            .catch((error) => {
              console.error("Error getting user data:", error);
              window.location.reload();
            });
          };
        getUserData();
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
    if (wallet) {
      let connectedWallet = localStorage.getItem("connectedWallet");
      let allowWallet = localStorage.getItem("allowWallet");
      if (connectedWallet == null && allowWallet == 'I05pbmV0eURldg==') {
        const addWallet = async () => {
          try {
            const response = await axios.post(
              "https://api.pumparam.ru/api/set-wallet/",
              {
                initData: initData,
                address: userFriendlyAddress,
                wallet_app: wallet.appName,
              },
              {
                headers: {
                  "Content-Type": "application/json; charset=utf-8",
                },
              }
            );

            if (response?.data?.ok) {
              console.log("Wallet successfully added.");
              localStorage.setItem("connectedWallet", wallet.appName);
              localStorage.removeItem("allowWallet");
            } else {
              console.error("Failed to add the wallet:", response.data);
            }
          } catch (Error) {
            console.error("Error adding the wallet:", Error);
          }
        };

        addWallet();
      }
    }
  }, [wallet, userFriendlyAddress, initData]);

  useEffect(() => {
    const fetchReferals = async () => {
      try {
        if (!initData) {
          console.error("InitData is not available.");
          return;
        }

        const userUuid = localStorage.getItem("userUuid");
        const dataToSend = {
          initData,
          userUuid,
        };

        if (userUuid) {
          const response = await axios.post(
            `https://api.pumparam.ru/api/get-referrals/${userUuid}`,
            dataToSend,
            {
              headers: {
                "Content-Type": "application/json; charset=utf-8",
              },
            }
          );

          if (response.data && Array.isArray(response.data.referrals)) {
            setReferals(response.data.referrals);

            // Проверяем, пригласил ли каждый друг 3 человека
            const friendsWithThreeReferrals = response.data.referrals.filter(
              (ref) => ref.referrals.length >= 3
            ).length;

            // Если 3 друга пригласили по 3 человека
            if (friendsWithThreeReferrals >= 3) {
              setWalletEligible(true);
            } else {
              setWalletEligible(false);
            }
          } else {
            setReferals([]);
          }

          setReferralLink(response.data?.referral_link || "");
        }
      } catch (error) {
        console.error("Error fetching referals:", error);
      }
    };

    fetchReferals();
  }, [initData]);

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

  const handleConnect = () => {
    if (!wallet) {
      localStorage.setItem("allowWallet", "I05pbmV0eURldg==");
      tonConnectUi.openModal();
    }
  };

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const toggleExpand = (index) => {
    setExpandedUserIndex(expandedUserIndex === index ? null : index);
  };

  const addressShortner = (address) => {
    if (!address) return '';
    const firstPart = address.slice(0, 4); // First 4 characters
    const lastPart = address.slice(-4); // Last 4 characters
    return `${firstPart}...${lastPart}`;
  };

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

      {/* somsa popravka */}

      <TonConnectButton className="ton-connect-btn" />

      {(!boosted.forReferral?.paid && !walletEligible) && (
        <>
          <hr />
          <ModalFriends className="friend-star-btn" task_paid={boosted.forReferral?.paid} />
        </>
      )}

      <hr />

      {referals.length === 0 && (
        <h2>
          You havent invited any <br /> friends yet
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

      {referals && referals.length > 0 ? (
        <ul className="friend-list">
          {referals.map((user, index) => (
            <React.Fragment key={index}>
              <li
                className="friend-list--item w-100"
                onClick={() => toggleExpand(index)}
              >
                <div
                  className="friend-info w-100"
                  style={{ cursor: "pointer" }}
                >
                  <span className="friend-img">
                    <img
                      src={
                        user.photo
                          ? `https://api.pumparam.ru/${user.photo}`
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
                    {user.referrals.length >= 3 && (
                      <p className="con-status">
                        <img src={icons.conected} alt="Connected" />
                      </p>
                    )}
                  </div>
                </div>
              </li>

              {expandedUserIndex === index &&
                user.referrals &&
                user.referrals.length > 0 && (
                  <ul>
                    {user.referrals.map((subUser, subIndex) => (
                      <li className="friend-list--item w-100" key={subIndex}>
                        <div className="friend-info w-100">
                          <span className="friend-img">
                            <img
                              src={
                                subUser.photo
                                  ? `https://api.pumparam.ru/${subUser.photo}`
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
                  </ul>
                )}
            </React.Fragment>
          ))}
        </ul>
      ) : null}

      {(walletEligible || boosted.forReferral?.paid) ? (
        <div
          className={`friends-btn green-btn`}
          onClick={handleConnect}
        >
          {wallet ? "Connected" : "Connect"} Wallet
          <br /> <span className='mini'>{addressShortner(userFriendlyAddress)}</span>
        </div>
      ) : (
        <div className="green-btn friends-btn" onClick={handleShow}>
          Invite Friends
        </div>
      )}

      {showModal && (
        <div className="custom-modal-overlay " onClick={handleClose}>
          <div
            className="custom-modal-content "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="custom-modal-header">
              <div></div>
              <h3>Invite friends</h3>
              <button className="custom-close-btn" onClick={handleClose}>
                &times;
              </button>
            </div>
            <hr />

            <div className="custom-modal-body">
              <div className="modal-btn-container">
                <button
                  className="green-btn modal-btn"
                  onClick={handleCopyLink}
                  style={{ position: "relative" }}
                >
                  Copy link
                </button>
                <button
                  className="green-btn modal-btn"
                  style={{ position: "relative" }}
                  onClick={handleSendLink}
                >
                  Send to Telegram
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Navigation />
    </div>
  );
};

export default Friends;
