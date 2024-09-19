import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; // Измените useHistory на useNavigate
import "../App.css";
import Navigation from "../components/navigetion"; // Предположим, что правильное название файла - navigation
import StarBtn from "../components/starBtn";

const Daily = () => {
  const [activeTab, setActiveTab] = useState("dailyTasks");
  const [tasks, setTasks] = useState([]);
  const [initData, setInitData] = useState(null);
  const [taskStatus, setTaskStatus] = useState({});
  const navigate = useNavigate(); // Используйте useNavigate вместо useHistory

  // Получаем initData из Telegram WebApp
  useEffect(() => {
    const telegram = window.Telegram?.WebApp;
    if (telegram) {
      const decodedInitData = decodeURIComponent(telegram.initData);
      setInitData(decodedInitData);
    } else {
      console.error("Telegram WebApp not found.");
    }
  }, []);

  // Получаем список задач с сервера после получения initData
  useEffect(() => {
    if (initData) {
      const fetchTasks = async () => {
        try {
          const response = await axios.post(
            "https://api.bot-dev.uz/api/get-tasks/",
            { initData },
            {
              headers: {
                "Content-Type": "application/json; charset=utf-8",
              },
            }
          );
          setTasks(response.data.tasks || []);

          const initialStatus = response.data.tasks.reduce(
            (acc, task) => ({
              ...acc,
              [task.id]: "Complete",
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

  const handleCompleteClick = (task) => {
    // Редирект на `link` задачи с помощью useNavigate
    if (task.link) {
      navigate(task.link);
    }
  };

  const handleVerifyClick = async (taskId) => {
    try {
      const response = await axios.post(
        `https://api.bot-dev.uz/api/confirm-task/${taskId}`,
        { initData },
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );

      if (response.data.ok) {
        setTaskStatus((prevStatus) => ({
          ...prevStatus,
          [taskId]: "Verify",
        }));
      } else {
        console.error("Task verification failed:", taskId);
      }
    } catch (error) {
      console.error("Error verifying task:", error);
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
      <hr className="daily-hr" />
      <StarBtn />
      <hr />
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
                  <button
                    className="task-btn"
                    onClick={() => handleCompleteClick(task)}
                    disabled={taskStatus[task.id] === "Verify"}
                  >
                    {taskStatus[task.id] === "Verify" ? "Verified" : "Complete"}
                  </button>
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
