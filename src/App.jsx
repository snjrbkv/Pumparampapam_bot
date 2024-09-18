import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Outlet } from "react-router-dom"; // Добавьте Outlet для маршрутизации
import LoadingPage from "./pages/loading";
import "./App.css";
function App() {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Задержка в 3 секунды для имитации загрузки

    return () => clearTimeout(timer); // Очищаем таймер при размонтировании компонента
  }, []);
  console.log("Muhammad odil telegram: @sanjarbek0v");
  return (
    <div className="App">
      {isLoading ? (
        <LoadingPage />
      ) : (
        <Outlet /> // Используем Outlet для рендеринга вложенных маршрутов
      )}
    </div>
  );
}

// function App() {
//   return <Outlet />;
// }
export default App;
