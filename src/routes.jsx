// import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";
// import LoadingPage from "./pages/loading.jsx"; // Loading component as a fallback

import First from "./pages/first.jsx";
import Second from "./pages/second.jsx";
import Thirds from "./pages/third.jsx";
import Daily from "./pages/daily.jsx";
import Home from "./pages/home.jsx";
import Friends from "./pages/friends.jsx";
import Onetime from "./pages/oneTime.jsx";
import Pump from "./pages/Pump.jsx";
import Infl from "./pages/infl.jsx";

// Define the router with lazy loading and Suspense for each route
export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Main app component
    children: [
      {
        path: "/", // Root path
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
        path: "/pump",
        element: <Pump />,
      },
      {
        path: "/infl",
        element: <Infl />,
      },
      {
        path: "/onetime",
        element: <Onetime />,
      },
    ],
  },
]);
