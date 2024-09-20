import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../App.css";
import Navigation from "../components/navigetion";
import StarBtn from "../components/starBtn";

const Daily = () => {
  const [activeTab, setActiveTab] = useState("dailyTasks");
  const [tasks, setTasks] = useState([]);
  const [initData, setInitData] = useState(null);
  const [taskStatus, setTaskStatus] = useState({});
  const [loadingStatus, setLoadingStatus] = useState({});

  useEffect(() => {
    const telegram = window.Telegram?.WebApp;
    if (telegram) {
      const decodedInitData = decodeURIComponent(telegram.initData);
      setInitData(decodedInitData);
    } else {
      console.error("Telegram WebApp not found.");
    }
  }, []);

  useEffect(() => {
    if (initData) {
      const fetchTasks = async () => {
        try {
          const response = await axios.post(
            "https://api.bot-dev.uz/api/get-tasks/?type=daily",
            { initData },
            {
              headers: {
                "Content-Type": "application/json; charset=utf-8",
              },
            }
          );

          const loadedTasks = response.data.tasks || [];
          setTasks(loadedTasks);

          // Update task status based on the response
          const initialStatus = loadedTasks.reduce(
            (acc, task) => ({
              ...acc,
              [task.id]: task.completed ? "Completed" : "Complete",
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
    if (task.link) {
      window.open(task.link, "_blank");
      setTaskStatus((prevStatus) => ({
        ...prevStatus,
        [task.id]: "Verify",
      }));
    }
  };

  const handleVerifyClick = async (task) => {
    setLoadingStatus((prevStatus) => ({
      ...prevStatus,
      [task.id]: true,
    }));

    try {
      const response = await axios.post(
        `https://api.bot-dev.uz/api/confirm-task/${task.uuid}`,
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
      }
    } catch (error) {
      console.error("Error confirming task:", error);
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
                  {taskStatus[task.id] === "Completed" ? (
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
                    >
                      Complete
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
