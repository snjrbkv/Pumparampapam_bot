import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../App.css";
import Navigation from "../components/navigetion.jsx";

const OneTime = () => {
  const [activeTab, setActiveTab] = useState("oneTimeTasks");
  const [tasks, setTasks] = useState([]);
  const [initData, setInitData] = useState(null);
  const [taskStatus, setTaskStatus] = useState({});
  const [loadingStatus, setLoadingStatus] = useState({});
  const [verifyClicks, setVerifyClicks] = useState({}); // Для отслеживания кликов по Verify
  const [boosted, setBoosted] = useState({});


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

  useEffect(() => {
    if (initData) {
      const fetchTasks = async () => {
        try {
          const response = await axios.post(
            "https://api.pumparam.ru/api/get-tasks/?type=one-time",
            { initData },
            {
              headers: {
                "Content-Type": "application/json; charset=utf-8",
              },
            }
          );

          const loadedTasks = response.data.tasks || [];
          setTasks(loadedTasks);

          // Установка начального статуса задач
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

  const handleCompleteClick = async (task) => {
    setLoadingStatus((prevStatus) => ({
      ...prevStatus,
      [task.id]: true,
    }));

    // Если task.link пустой, равен '.' или '0', отправляем запрос на сервер
    if (!task.link || task.link === "." || task.link === "0") {
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
      // Открываем ссылку в Telegram и меняем статус на Verify
      Telegram.WebApp.openLink(task.link);
      setTaskStatus((prevStatus) => ({
        ...prevStatus,
        [task.id]: "Verify",
      }));
      setVerifyClicks((prevClicks) => ({
        ...prevClicks,
        [task.id]: 0, // Сброс количества кликов при нажатии "Start"
      }));
    }

    setLoadingStatus((prevStatus) => ({
      ...prevStatus,
      [task.id]: false,
    }));
  };

  const handleVerifyClick = async (task) => {
    const currentClicks = verifyClicks[task.id] || 0;

    // Если уже 1 раз нажали на Verify и статус не изменился, вернуть на Start
    if (currentClicks >= 1) {
      setTaskStatus((prevStatus) => ({
        ...prevStatus,
        [task.id]: "Start",
      }));
      setVerifyClicks((prevClicks) => ({
        ...prevClicks,
        [task.id]: 0, // Сброс счётчика
      }));
      return;
    }

    setLoadingStatus((prevStatus) => ({
      ...prevStatus,
      [task.id]: true,
    }));

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
        setVerifyClicks((prevClicks) => ({
          ...prevClicks,
          [task.id]: currentClicks + 1, // Увеличиваем счётчик кликов
        }));
      }
    } catch (error) {
      console.error("Error confirming task:", error);
      setVerifyClicks((prevClicks) => ({
        ...prevClicks,
        [task.id]: currentClicks + 1, // Увеличиваем счётчик кликов в случае ошибки
      }));
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
          onClick={() => setActiveTab("oneTimeTasks")}
        >
          One-time Tasks
        </Link>
      </div>
      <p className="daily-sub-title">
        Complete daily tasks and get <br /> bonuses in the form of tokens.
      </p>
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
                    <button
                      className="task-btn"
                      onClick={() => handleCompleteClick(task)}
                      disabled={loadingStatus[task.id]}
                    >
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

export default OneTime;
