import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav } from "react-bootstrap";
import { HouseDoorFill, BarChartFill, PeopleFill } from "react-bootstrap-icons";
import { Link, useLocation } from "react-router-dom"; // Добавляем useLocation
import icons from "../assets/icons/icons.jsx";

const Navigation = () => {
  const location = useLocation(); // Получаем текущий URL
  const [active, setActive] = useState("");

  useEffect(() => {
    // Обновляем активный пункт меню в зависимости от текущего пути
    if (location.pathname === "/home") {
      setActive("home");
    } else if (location.pathname === "/daily") {
      setActive("tasks");
    } else if (location.pathname === "/friends") {
      setActive("friends");
    } else if (location.pathname === "/pump") {
      setActive("pump");
    }
  }, [location.pathname]); // Срабатывает каждый раз при изменении URL

  return (
    <Navbar
      fixed="bottom"
      className="justify-content-center, align-items-center, d-flex"
      style={{
        margin: "0 auto 3% auto",
        width: "90%",
        backgroundColor: "#2C2C2C",
        borderRadius: "999px",
      }}
    >
      <Nav className="w-100 justify-content-around">
        <Nav.Item>
          <Link
            to="/home"
            className="text-center nav-link"
            onClick={() => setActive("home")}
            style={{
              color: active === "home" ? "#B4F2D0" : "#A0A0A0",
              backgroundColor: active === "home" ? "transparent" : "#2C2C2C",
              borderRadius: "20px",
            }}
          >
            <HouseDoorFill size={24} />
            <div>Home</div>
          </Link>
        </Nav.Item>

        <Nav.Item>
          <Link
            to="/pump"
            className="text-center nav-link "
            onClick={() => setActive("pump")}
            style={{
              color: active === "pump" ? "#B4F2D0" : "#A0A0A0",
              backgroundColor: active === "pump" ? "transparent" : "#2C2C2C",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              flexDirection: "column",
              position: "relative",
            }}
          >
            <img
              src={icons.pump}
              alt="Pump Icon"
              style={{
                width: "45px",
                height: "24px",
                objectFit: "contain",
                top: "0",
              }}
            />
            <div>Pump</div>
          </Link>
        </Nav.Item>
        {/* upload */}
        <Nav.Item>
          <Link
            to="/daily"
            className="text-center nav-link"
            onClick={() => setActive("tasks")}
            style={{
              color: active === "tasks" ? "#B4F2D0" : "#A0A0A0",
              backgroundColor: active === "tasks" ? "transparent" : "#2C2C2C",
              borderRadius: "20px",
            }}
          >
            <BarChartFill size={24} />
            <div>Tasks</div>
          </Link>
        </Nav.Item>

        <Nav.Item>
          <Link
            to="/friends"
            className="text-center nav-link"
            onClick={() => setActive("friends")}
            style={{
              color: active === "friends" ? "#B4F2D0" : "#A0A0A0",
              backgroundColor: active === "friends" ? "transparent" : "#2C2C2C",
              borderRadius: "20px",
            }}
          >
            <PeopleFill size={24} />
            <div>Friends</div>
          </Link>
        </Nav.Item>
      </Nav>
    </Navbar>
  );
};

export default Navigation;
