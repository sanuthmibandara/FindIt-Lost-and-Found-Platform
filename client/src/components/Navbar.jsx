import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileMenu from "./profile/ProfileMenu";
import "./Navbar.css";

function Navbar() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  const handleSearch = (e) => {
    e.preventDefault();
    const value = e.target.search.value.trim();
    const params = new URLSearchParams(searchParams);
    if (value) params.set("search", value);
    else params.delete("search");
    setSearchParams(params);
  };

  return (
    <header className="site-header">
      <div className="top-bar">
        <div className="top-bar-inner">
          <span>For University Students</span>
          <span>Lost &amp; Found Platform</span>
        </div>
      </div>

      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <svg className="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
            </svg>
            FindIt
          </Link>

          <ul className="navbar-links">
            <li><Link to="/">Browse</Link></li>
            <li><Link to="/create-post">Post Item</Link></li>
            <li><a href="#how-it-works">How It Works</a></li>
          </ul>

          <form className="navbar-search" onSubmit={handleSearch}>
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              name="search"
              placeholder="Search lost or found items..."
              defaultValue={search}
              key={search}
            />
          </form>

          <div className="navbar-actions">
            {isAuthenticated ? (
              <ProfileMenu />
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn-login">Login</Link>
                <Link to="/register" className="btn-register">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
