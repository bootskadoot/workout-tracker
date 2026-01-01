import { DEFAULT_USERS, type User } from "../userContext";

interface Props {
  onSelectUser: (user: User) => void;
}

export function ProfileSelection({ onSelectUser }: Props) {
  return (
    <div className="profile-selection-overlay">
      <div className="profile-selection-content">
        <h1 className="profile-selection-title">Workout Tracker</h1>
        <p className="profile-selection-subtitle">Choose your profile</p>

        <div className="profile-list">
          {DEFAULT_USERS.map((user) => (
            <button
              key={user.id}
              className="profile-card"
              onClick={() => onSelectUser(user)}
            >
              <div className="profile-icon">{user.name.charAt(0).toUpperCase()}</div>
              <span className="profile-name">{user.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
