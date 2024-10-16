import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes.jsx"; // Путь к вашему файлу с роутером

// if (
//   window.Telegram &&
//   window.Telegram.WebApp &&
//   window.Telegram.WebApp.initData &&
//   window.Telegram.WebApp.initData.length > 0
// ) {
//   console.log("TELEGRAM WEB APP open");
//   let tg = window.Telegram.WebApp;
//   tg.expand();
//   tg.enableClosingConfirmation();
// } else {
//   console.log("ANOTHER APP open");
//   window.location.href = "https://ninetydev.uz";
// }

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
