import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DashBoard from "./components/DashBoard.jsx";
import LoginForm from "./components/connexion/LoginForm.jsx";
import RegisterForm from "./components/connexion/RegisterForm.jsx";
import ProtectedRoute from "./components/connexion/ProtectedRoute.jsx";
import { useState } from "react";
import Game from "./components/Game.jsx";
import Layout from "./components/layout/Layout.jsx";
import LayoutRegistration from "./components/layout/LayoutRegistration.jsx";
import { postData } from "./services/ws-services.jsx";
import ConfirmPage from "./components/connexion/ConfirmPage.jsx";

export default function App() {
  if (
    localStorage.getItem("theme") === "dark" ||
    (!localStorage.getItem("theme") &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("token") !== null
  );
  // Simulate a login function
  const handleLogin = (pData) => {
    postData("/login", pData).then((data) => {
      console.log("Server response", data);
      if (data.error) {
        alert(data.error);
        return;
      }
      setIsAuthenticated(true);
      localStorage.setItem("token", data["token"]);
      localStorage.setItem("user", JSON.stringify(data["user"]));
      router.navigate("/");
    });
  };

  // Simulate a logout function
  const handleLogout = () => {
    postData("/logout", {}).then((data) => {
      console.log("Server response", data);
      if (data.error) {
        alert(data.error);
        return;
      }
      if (data["logout"]) {
        setIsAuthenticated(false);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.navigate("/auth");
      }
    });
  };

  // Define your routes using createBrowserRouter
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <Layout isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      ),
      children: [
        {
          index: true, // This makes the path="/" point to Dashboard
          element: (
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DashBoard />
            </ProtectedRoute>
          ),
        },
        {
          path: "game",
          element: (
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Game />
            </ProtectedRoute>
          ),
        },
      ],
    },
    {
      path: "/auth/",
      element: <LayoutRegistration />,
      children: [
        {
          index: true, // This makes the path="/" point to Dashboard
          element: <LoginForm onLogin={handleLogin} />,
        },
        {
          path: "register",
          element: <RegisterForm />,
        },
        {
          path: "confirmEmail/:email",
          element: <ConfirmPage />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}
