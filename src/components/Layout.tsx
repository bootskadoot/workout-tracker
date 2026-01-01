import { Link, NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { useUser } from "../userContext";
import { isSupabaseConfigured } from "../supabaseClient";

interface Props {
  children: ReactNode;
  syncing?: boolean;
  lastSync?: Date | null;
}

export function Layout({ children, syncing, lastSync }: Props) {
  const { currentUser, logout } = useUser();

  const formatLastSync = (date: Date | null | undefined) => {
    if (!date) return null;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

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
          {isSupabaseConfigured() && (
            <div className="sync-status">
              {syncing ? (
                <span className="sync-indicator syncing">
                  <span className="sync-spinner"></span>
                  Syncing...
                </span>
              ) : lastSync ? (
                <span className="sync-indicator synced" title={`Last synced: ${lastSync.toLocaleString()}`}>
                  ☁ {formatLastSync(lastSync)}
                </span>
              ) : (
                <span className="sync-indicator offline">☁ Offline</span>
              )}
            </div>
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



