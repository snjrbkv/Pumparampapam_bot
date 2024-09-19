import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes"; // Путь к вашему файлу с роутером

if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData && window.Telegram.WebApp.initData.length > 0) {
  let tg = window.Telegram.WebApp;
  tg.expand();
  tg.enableClosingConfirmation();
} else {
  console.error("Telegram API is not available.");
  window.location.href = "https://ninetydev.uz";
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
