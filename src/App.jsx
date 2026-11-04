import { useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import MainPage from "./Pages/MainPage/MainPage";
import Temple from "./Components/Temple/temple";
import Dieties from "./Components/Dieties/dieties";
import Festivals from "./Components/Festivals/festivals";
import Dashboard from "./Components/Dashboard/dashboard";
import Profile from "./Components/Profile/Profile";
import Backlog from "./Components/Backlog/Backlog";

function SessionExpiryHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleExpired = () => navigate("/login", { replace: true });
    window.addEventListener("admin:session-expired", handleExpired);
    return () => window.removeEventListener("admin:session-expired", handleExpired);
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <SessionExpiryHandler />
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="temple" element={<Temple />} />
          <Route path="dieties" element={<Dieties />} />
          <Route path="festivals" element={<Festivals />} />
          <Route path="profile" element={<Profile />} />
          <Route path="backlog" element={<Backlog />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
