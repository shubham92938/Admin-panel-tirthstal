import "./Navbar.css";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

const PAGE_NAMES = {
  "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/temple": "Temples",
  "/dieties": "Deities",
  "/festivals": "Festivals",
  "/profile": "Profile & security",
  "/backlog": "Backend backlog",
};

export default function Navbar({ setIsOpen, isOpen }) {
  const location = useLocation();
  const pageName = PAGE_NAMES[location.pathname] || "Admin panel";

  return (
    <header className={`navbar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <div className="navbar_left">
        <button className="menu-btn" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle navigation"><Menu size={22} /></button>
        <h3 id="dashboard">{pageName}</h3>
      </div>
      <div className="navbar_right">
        <Link to="/profile" className="profile" aria-label="Open admin profile">
          <img src="/Image.png" alt="" />
          <div className="profile-info"><h4>Admin</h4><p>Profile & security</p></div>
        </Link>
      </div>
    </header>
  );
}
