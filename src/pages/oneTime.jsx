import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import Navigetion from "../components/navigetion";

const OneTime = () => {
  const [activeTab, setActiveTab] = useState("oneTimeTasks");
  const [taskStatus, setTaskStatus] = useState({}); // Track task statuses

  // Load task status from localStorage on component mount
  useEffect(() => {
    const savedStatus = localStorage.getItem("taskStatus");
    if (savedStatus) {
      setTaskStatus(JSON.parse(savedStatus));
    }
  }, []);

  // Save task status to localStorage whenever taskStatus changes
  useEffect(() => {
    localStorage.setItem("taskStatus", JSON.stringify(taskStatus));
  }, [taskStatus]);

  const handleTaskClick = (index) => {
    // Set the task to "in-progress" when clicked
    setTaskStatus((prevStatus) => ({
      ...prevStatus,
      [index]: "in-progress", // Start loading
    }));

    // Simulate a delay before marking the task as "completed"
    setTimeout(() => {
      setTaskStatus((prevStatus) => ({
        ...prevStatus,
        [index]: "completed", // Mark the task as completed after delay
      }));
    }, 2000); // 2 seconds delay for loading effect
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
        {[...Array(8)].map((_, index) => (
          <React.Fragment key={index}>
            <li className="task-list--item">
              <div className="task-info">
                <span className="task-img"></span>
                <div className="task-text">
                  <p className="task-title">Complete Afterland’s Tutorial</p>
                  <p className="task-day">1 day</p>
                </div>
              </div>
              <div className="task-buttons">
                <button
                  className={`task-btn ${
                    taskStatus[index] === "completed"
                      ? "task-btn-completed"
                      : taskStatus[index] === "in-progress"
                      ? "task-btn-in-progress"
                      : ""
                  }`}
                  onClick={() => handleTaskClick(index)}
                  disabled={taskStatus[index] === "completed"}
                >
                  {taskStatus[index] === "completed" ? (
                    "Completed"
                  ) : taskStatus[index] === "in-progress" ? (
                    <span className="cross-icon"></span>
                  ) : (
                    "Complete"
                  )}
                </button>
              </div>
            </li>
            {index < 7 && <hr />}
          </React.Fragment>
        ))}
        <hr className="last-hr" />
      </ul>
      <Navigetion />
    </div>
  );
};

export default OneTime;
