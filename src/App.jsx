import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Outlet } from "react-router-dom";
import LoadingPage from "./pages/loading";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import "./App.css";
import { Buffer } from "buffer";
window.Buffer = Buffer;

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Задержка в 2 секунды для имитации загрузки

    return () => clearTimeout(timer);
  }, []);

  return (
    <TonConnectUIProvider
      manifestUrl="https://pumparam.ru/tonconnect-manifest.json"
      actionsConfiguration={{
        twaReturnUrl: "https://t.me/PumparamBot/",
      }}
    >
      <div className="App">{isLoading ? <LoadingPage /> : <Outlet />}</div>
    </TonConnectUIProvider>
  );
}

export default App;
