import React from "react"; // Добавьте этот импорт
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import First from "./pages/first";
import Second from "./pages/second";
import Thirds from "./pages/third";
import Daily from "./pages/daily";
import Home from "./pages/home";
import Friends from "./pages/friends";
import Onetime from "./pages/oneTime";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <First />,
      },
      {
        path: "/second",
        element: <Second />,
      },
      {
        path: "/third",
        element: <Thirds />,
      },
      {
        path: "/daily",
        element: <Daily />,
      },
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/friends",
        element: <Friends />,
      },
      {
        path: "/onetime",
        element: <Onetime />,
      },
    ],
  },
]);
