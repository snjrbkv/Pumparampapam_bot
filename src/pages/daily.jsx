import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../App.css";
import Navigetion from "../components/navigetion";
import StarBtn from "../components/starBtn";

const Daily = () => {
  const [activeTab, setActiveTab] = useState("dailyTasks");
  const [tasks, setTasks] = useState([]);
  const [initData, setInitData] = useState(null);
  const [taskStatus, setTaskStatus] = useState({});

  // Telegram WebApp dan initData ni olish
  useEffect(() => {
    const telegram = window.Telegram?.WebApp;
    if (telegram) {
      const initData = telegram.initData;
      setInitData(initData);
    } else {
      console.error("Telegram WebApp not found.");
    }
  }, []);

  // initData bilan vazifalarni API orqali olish
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
          console.log("Tasks from API:", response.data);

          if (response.data && Array.isArray(response.data.tasks)) {
            setTasks(response.data.tasks);
          } else {
            console.error("Unexpected API response format:", response.data);
          }
        } catch (error) {
          console.error("Error fetching tasks:", error);
        }
      };

      fetchTasks();
    }
  }, [initData]);

  // Taskni tasdiqlash va "Completed" holatiga o'tkazish
  const handleVerifyClick = async (task) => {
    try {
      const response = await axios.post(
        `https://api.bot-dev.uz/api/confirm-task/${task.uuid}`,
        { initData },
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );
      console.log("Task verified:", response.data);

      // Agar API dan ok true kelsa, tugma "Completed" ga aylanadi
      if (response.data.ok) {
        setTaskStatus((prevStatus) => ({
          ...prevStatus,
          [task.id]: "completed",
        }));
      } else {
        setTaskStatus((prevStatus) => ({
          ...prevStatus,
          [task.id]: "verify",
        }));
        console.error("Task verification failed.");
      }
    } catch (error) {
      console.error("Error verifying task:", error);
    }
  };

  // Tugmani bosish holatini o'zgartirish
  const handleButtonClick = (task) => {
    if (task.completed) {
      // Открываем ссылку в новой вкладке/окне
      window.open(task.link, "_blank");
    } else {
      setTaskStatus((prevStatus) => ({
        ...prevStatus,
        [task.id]: "verify",
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
                    onClick={() =>
                      taskStatus[task.id] === "verify"
                        ? handleVerifyClick(task)
                        : handleButtonClick(task)
                    }
                    disabled={taskStatus[task.id] === "completed"}
                  >
                    {taskStatus[task.id] === "completed"
                      ? "Completed"
                      : taskStatus[task.id] === "verify"
                      ? "Verify"
                      : "Complete"}
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
      <Navigetion />
    </div>
  );
};

export default Daily;
