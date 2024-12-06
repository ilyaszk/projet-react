/* eslint-disable react/prop-types */
import { Outlet } from "react-router-dom";
import NavBar from "../NavBar.jsx";

export default function Layout({ isAuthenticated, onLogout }) {
  return (
    <div className="h-screen overflow-y-hidden">
      {/* Show NavBar only if authenticated */}
      {isAuthenticated && <NavBar onLogout={onLogout} />}

      {/* This is where the children routes will be rendered */}
      <Outlet />
    </div>
  );
}
