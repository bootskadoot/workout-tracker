import { Link, NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { useUser } from "../userContext";

interface Props {
  children: ReactNode;
}

export function Layout({ children }: Props) {
  const { currentUser, logout } = useUser();

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header-left">
          <Link to="/" className="app-title">
            Workout Tracker
          </Link>
          {currentUser && (
            <span className="current-user-badge">{currentUser.name}</span>
          )}
        </div>
        <nav className="app-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Log
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            History
          </NavLink>
          <NavLink to="/charts" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Charts
          </NavLink>
          <NavLink to="/prs" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            PRs
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Exercises
          </NavLink>
          <button className="nav-link switch-user-btn" onClick={logout}>
            Switch User
          </button>
        </nav>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}



