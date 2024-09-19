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

  // Получаем initData из Telegram WebApp
  useEffect(() => {
    const telegram = window.Telegram?.WebApp;
    if (telegram) {
      // Decode initData for proper usage
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
            { initData }, // sending decoded initData
            {
              headers: {
                "Content-Type": "application/json; charset=utf-8",
              },
            }
          );
          setTasks(response.data.tasks || []);

          // Инициализируем статус всех задач как "Complete"
          const initialStatus = {};
          response.data.tasks.forEach((task) => {
            initialStatus[task.id] = "Complete";
          });
          setTaskStatus(initialStatus);
        } catch (error) {
          console.error("Error fetching tasks:", error);
        }
      };

      fetchTasks();
    }
  }, [initData]);

  // Функция для изменения статуса конкретной задачи на "Verify"
  const handleButtonClick = async (taskId) => {
    console.log("Button clicked for task:", taskId);
    console.log("initData:", initData); // Логируем initData для проверки

    try {
      // Формируем данные для отправки
      const requestData = { initData, task: taskId };
      console.log("Request data being sent:", requestData); // Логируем данные запроса

      // Отправляем запрос на подтверждение выполнения задачи
      const response = await axios.post(
        `https://api.bot-dev.uz/api/confirm-task/${taskId}`, // taskId передается в URL
        { initData }, // ensure proper payload
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );

      console.log("Response from API:", response.data); // Логируем ответ от API

      if (response.data.ok === true) {
        console.log("Task verified:", taskId);

        // Обновляем статус задачи на "Verify"
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
        {/* Переключение вкладок */}
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

      {/* Отображение списка задач */}
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
                  {/* Кнопка для подтверждения задачи */}
                  <button
                    className="task-btn"
                    onClick={() => handleButtonClick(task.id)} // Передаем task.id в обработчик
                    disabled={taskStatus[task.id] === "Verify"} // Отключаем кнопку, если статус "Verify"
                  >
                    {taskStatus[task.id] === "Verify" ? "Verify" : "Complete"}{" "}
                    {/* Отображаем текст кнопки в зависимости от статуса */}
                  </button>
                </div>
              </li>
              {tasks.indexOf(task) < tasks.length - 1 && <hr />}
            </React.Fragment>
          ))
        ) : (
          <p>Loading tasks...</p> // Показать, если задачи загружаются
        )}
        <hr className="last-hr" />
      </ul>
      <Navigetion />
    </div>
  );
};

export default Daily;
