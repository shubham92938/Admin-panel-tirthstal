import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import { ClipboardList, HomeIcon, SparklesIcon, UserRound } from "lucide-react";
import { GiTempleGate } from "react-icons/gi";
import { Flame } from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { to: "/temple", label: "Temples", icon: GiTempleGate },
  { to: "/dieties", label: "Deities", icon: Flame },
  { to: "/festivals", label: "Festivals", icon: SparklesIcon },
  { to: "/profile", label: "Profile", icon: UserRound },
  { to: "/backlog", label: "Backend backlog", icon: ClipboardList },
];

export default function Sidebar({ isOpen }) {
  return (
    <aside className={`sidebar ${isOpen ? "open" : "close"}`}>
      <div className="sidebar_top">
        <div className="sidebar__logo">
          <div className="logo__icon"><img src="/Image.png" alt="Tirthstal" /></div>
          <h1>Tirthstal<span id="black">Admin</span></h1>
        </div>
      </div>
      <nav aria-label="Admin navigation">
        <ul className="sidebar__menu">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink to={to} className={({ isActive }) => `link ${isActive ? "active" : ""}`} title={label}>
                <Icon size={20} /><span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <NavLink to="/profile" className="user-account">
        <div className="badgeicon"><img src="/Image.png" alt="" /></div>
        <div><h1 id="fresh">Admin</h1><h3 id="owner">Account settings</h3></div>
      </NavLink>
    </aside>
  );
}
