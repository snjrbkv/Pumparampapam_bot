import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../App.css";
import Navigation from "../components/navigetion.jsx";
import StarBtn from "../components/starBtn.jsx";
import {
  TonConnectButton,
  useTonWallet,
  useTonAddress,
} from "@tonconnect/ui-react";

const Daily = () => {
  const [activeTab, setActiveTab] = useState("dailyTasks");
  const [tasks, setTasks] = useState([]);
  const [initData, setInitData] = useState(null);
  const [taskStatus, setTaskStatus] = useState({});
  const [loadingStatus, setLoadingStatus] = useState({});
  const [boosted, setBoosted] = useState({});
  const [verifyAttempts, setVerifyAttempts] = useState({});
  const maxDays = localStorage.getItem("TOTAL_DAY_FOR_TASK") || 999;

  const userFriendlyAddress = useTonAddress();
  const wallet = useTonWallet();

  // Получение начальных данных с Telegram WebApp
  useEffect(() => {
    const telegram = window.Telegram?.WebApp;
    if (telegram) {
      const decodedInitData = decodeURIComponent(telegram.initData);
      setInitData(decodedInitData);

      const getUserData = async () => {
        try {
          const res = await axios.post(
            "https://api.pumparam.ru/api/get-user/",
            { initData: telegram.initData },
            {
              headers: {
                "Content-Type": "application/json; charset=utf-8",
              },
            }
          );
          setBoosted(res.data?.boosted);
        } catch (error) {
          console.error("Error getting user data:", error);
          window.location.reload();
        }
      };
      getUserData();
    } else {
      console.error("Telegram WebApp not found.");
    }
  }, []);

  // Добавление кошелька после подключения
  useEffect(() => {
    if (wallet) {
      const connectedWallet = localStorage.getItem("connectedWallet");
      const allowWallet = localStorage.getItem("allowWallet");
      if (!connectedWallet && allowWallet === "I05pbmV0eURldg==") {
        const addWallet = async () => {
          try {
            const response = await axios.post(
              `https://api.pumparam.ru/api/set-wallet/`,
              {
                initData,
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
          } catch (error) {
            console.error("Error adding the wallet:", error);
          }
        };
        addWallet();
      }
    }
  }, [wallet, userFriendlyAddress, initData]);

  // Получение списка задач
  useEffect(() => {
    if (initData) {
      const fetchTasks = async () => {
        try {
          const response = await axios.post(
            "https://api.pumparam.ru/api/get-tasks/?type=daily",
            { initData },
            {
              headers: {
                "Content-Type": "application/json; charset=utf-8",
              },
            }
          );
          const loadedTasks = response.data.tasks || [];
          setTasks(loadedTasks);

          // Установка начального статуса для каждой задачи
          const initialStatus = loadedTasks.reduce(
            (acc, task) => ({
              ...acc,
              [task.id]: task.completed ? "Completed" : "Start",
            }),
            {}
          );
          setTaskStatus(initialStatus);
        } catch (error) {
          console.error("Error fetching tasks:", error);
        }
      };
      fetchTasks();
    }
  }, [initData]);

  // Обработка нажатия на кнопку "Start"
  const handleCompleteClick = async (task) => {
    // Если task.link пустой, равен '.', или '0', перезагружаем страницу и устанавливаем статус как "Completed"
    if (!task.link || task.link === "." || task.link === "0") {
      // Перезагружаем страницу
      try {
        const response = await axios.post(
          `https://api.pumparam.ru/api/confirm-task/${task.uuid}`,
          {
            taskId: task.id,
            initData,
          },
          {
            headers: {
              "Content-Type": "application/json; charset=utf-8",
            },
          }
        );

        if (response.data.ok === true) {
          setTaskStatus((prevStatus) => ({
            ...prevStatus,
            [task.id]: "Completed",
          }));
        } else {
          console.error("Failed to confirm task.");
        }
      } catch (error) {
        console.error("Error confirming task:", error);
      }
    } else {
      window.Telegram.WebApp.openLink(task.link, "_blank"); // Открываем ссылку в новом окне
      setTaskStatus((prevStatus) => ({
        ...prevStatus,
        [task.id]: "Verify", // Устанавливаем статус как "Verify"
      }));
    }
  };

  // Обработка нажатия на кнопку "Verify"
  const handleVerifyClick = async (task) => {
    setLoadingStatus((prevStatus) => ({
      ...prevStatus,
      [task.id]: true,
    }));

    const currentAttempts = verifyAttempts[task.id] || 0;

    try {
      const response = await axios.post(
        `https://api.pumparam.ru/api/confirm-task/${task.uuid}`,
        {
          taskId: task.id,
          initData,
        },
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );

      if (response.data.ok) {
        setTaskStatus((prevStatus) => ({
          ...prevStatus,
          [task.id]: "Completed",
        }));
        setVerifyAttempts((prevAttempts) => ({
          ...prevAttempts,
          [task.id]: 0,
        }));
      } else {
        // Если попытка верификации не удалась, сбрасываем статус задачи
        if (currentAttempts >= 1) {
          console.log(`Task ${task.id} resetting to Start`);
          setTaskStatus((prevStatus) => ({
            ...prevStatus,
            [task.id]: "Start",
          }));
          setVerifyAttempts((prevAttempts) => ({
            ...prevAttempts,
            [task.id]: 0,
          }));
        } else {
          setVerifyAttempts((prevAttempts) => ({
            ...prevAttempts,
            [task.id]: currentAttempts + 1,
          }));
        }
      }
    } catch (error) {
      console.error("Error verifying task:", error);
    } finally {
      setLoadingStatus((prevStatus) => ({
        ...prevStatus,
        [task.id]: false,
      }));
    }
  };

  return (
    <div className="daily-in">
      <div className="toggle-btn-group">
        <Link
          to="/daily"
          className={`toggle-btn ${
            activeTab === "dailyTasks" ? "active" : "inactive"
          }`}
          onClick={() => setActiveTab("dailyTasks")}
        >
          Daily Tasks
        </Link>
        <Link
          to="/onetime"
          className={`toggle-btn ${
            activeTab === "oneTimeTasks" ? "active" : "inactive"
          }`}
          фы
          onClick={() => setActiveTab("oneTimeTasks")}
        >
          One-time Tasks
        </Link>
      </div>
      <p className="daily-sub-title">
        Complete daily tasks and get <br /> bonuses in the form of tokens.
      </p>
      <hr className="daily-hr" />
      {maxDays - boosted.forTask?.days > 0 && (
        <>
          <StarBtn
            task_days={boosted.forTask?.days}
            task_paid={boosted.forTask?.paid}
          />
          <hr />
        </>
      )}
      <TonConnectButton className="ton-connect-btn" />
      <ul className="task-list">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <React.Fragment key={task.id}>
              <li className="task-list--item">
                <span className="task-img"></span>
                <div className="task-text">
                  <p className="task-title">{task.title}</p>
                  <p className="task-day">{task.description}</p>
                </div>
                <div className="task-buttons">
                  {boosted.forTask?.paid ? (
                    <button className="task-btn" disabled>
                      Completed
                    </button>
                  ) : taskStatus[task.id] === "Completed" ? (
                    <button className="task-btn" disabled>
                      Completed
                    </button>
                  ) : taskStatus[task.id] === "Verify" ? (
                    <button
                      className="task-btn"
                      onClick={() => handleVerifyClick(task)}
                      disabled={loadingStatus[task.id]}
                    >
                      {loadingStatus[task.id] ? "Loading..." : "Verify"}
                    </button>
                  ) : (
                    <button className="task-btn" onClick={() => handleCompleteClick(task)}>
                      Start
                    </button>
                  )}
                </div>
              </li>
              {tasks.indexOf(task) < tasks.length - 1 && <hr />}
            </React.Fragment>
          ))
        ) : (
          <p>Loading tasks...</p>
        )}
        <hr className="last-hr" />
      </ul>
      <Navigation />
    </div>
  );
};

export default Daily;
