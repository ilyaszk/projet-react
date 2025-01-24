/* eslint-disable react/prop-types */
import { Outlet } from "react-router-dom";
import NavBar from "../NavBar.jsx";

export default function Layout({ isAuthenticated, onLogout }) {
  return (
    <div className="h-screen flex flex-col">
      {isAuthenticated && <NavBar onLogout={onLogout} />}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
