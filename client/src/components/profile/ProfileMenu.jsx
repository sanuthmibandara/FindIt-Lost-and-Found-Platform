import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./ProfileMenu.css";

function ProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(null); // view | edit | delete

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/");
  };

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        type="button"
        className="profile-avatar"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Profile menu"
      >
        {initials}
      </button>

      {open && (
        <div className="profile-dropdown">
          <div className="profile-dropdown-header">
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
          <button type="button" onClick={() => { setModal("view"); setOpen(false); }}>
            View Profile
          </button>
          <button type="button" onClick={() => { setModal("edit"); setOpen(false); }}>
            Edit Profile
          </button>
          <button type="button" onClick={() => { setModal("delete"); setOpen(false); }}>
            Delete Account
          </button>
          <hr />
          <Link to="/my-posts" onClick={() => setOpen(false)}>
            My Posts
          </Link>
          <Link to="/my-claims" onClick={() => setOpen(false)}>
            My Claims
          </Link>
          <Link to="/received-claims" onClick={() => setOpen(false)}>
            Received Claims
          </Link>
          <Link to="/create-post" onClick={() => setOpen(false)}>
            Create Post
          </Link>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}

      {modal === "view" && (
        <div className="profile-modal-overlay" onClick={() => setModal(null)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <h3>My Profile</h3>
            <div className="profile-field">
              <label>Name</label>
              <p>{user?.name}</p>
            </div>
            <div className="profile-field">
              <label>Email</label>
              <p>{user?.email}</p>
            </div>
            <button type="button" className="modal-close-btn" onClick={() => setModal(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {modal === "edit" && (
        <div className="profile-modal-overlay" onClick={() => setModal(null)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Profile</h3>
            <p className="modal-note">
              Profile editing will be available in a future update. For now you can view your account details.
            </p>
            <div className="profile-field">
              <label>Name</label>
              <input type="text" defaultValue={user?.name} disabled />
            </div>
            <div className="profile-field">
              <label>Email</label>
              <input type="email" defaultValue={user?.email} disabled />
            </div>
            <button type="button" className="modal-close-btn" onClick={() => setModal(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {modal === "delete" && (
        <div className="profile-modal-overlay" onClick={() => setModal(null)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Account</h3>
            <p className="modal-note danger">
              Account deletion will be available in a future update. Contact support if you need to remove your account.
            </p>
            <button type="button" className="modal-close-btn" onClick={() => setModal(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
