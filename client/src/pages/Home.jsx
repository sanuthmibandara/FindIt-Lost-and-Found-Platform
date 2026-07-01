import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getPosts } from "../services/api";
import { getErrorMessage } from "../utils/errorMessages";
import { POST_CATEGORIES } from "../utils/categories";
import PostCard from "../components/home/PostCard";
import FilterSidebar from "../components/home/FilterSidebar";
import "./Home.css";

const defaultFilters = {
  types: [],
  categories: [],
  openOnly: true,
};

const categoryIcons = {
  Electronics: "💻",
  Wallet: "👛",
  Keys: "🔑",
  "ID Card": "🪪",
  Books: "📚",
  Clothing: "👕",
  Helmet: "⛑️",
  Bag: "🎒",
  Jewelry: "💍",
  "Water Bottle": "🥤",
  Others: "📦",
};

function Home() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const lastSearchToast = useRef("");

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [heroError, setHeroError] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await getPosts();
        setPosts(res.data.posts || []);
      } catch (err) {
        toast.error(getErrorMessage(err, "Could not load posts. Please refresh the page."));
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      );
    }

    if (filters.types.length) {
      result = result.filter((p) => filters.types.includes(p.type));
    }

    if (filters.categories.length) {
      result = result.filter((p) => filters.categories.includes(p.category));
    }

    if (activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (filters.openOnly) {
      result = result.filter((p) => p.status === "Open");
    }

    switch (sortBy) {
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [posts, searchQuery, filters, activeCategory, sortBy]);

  useEffect(() => {
    if (loading || !searchQuery) return;
    if (filteredPosts.length === 0 && lastSearchToast.current !== searchQuery) {
      lastSearchToast.current = searchQuery;
      toast.info(`No results found for "${searchQuery}". Try different keywords.`);
    }
    if (filteredPosts.length > 0) {
      lastSearchToast.current = "";
    }
  }, [searchQuery, filteredPosts.length, loading, toast]);

  const activeFilterTags = [
    ...filters.types,
    ...filters.categories,
    ...(activeCategory !== "All" ? [activeCategory] : []),
    ...(searchQuery ? [`"${searchQuery}"`] : []),
  ];

  return (
    <div className="home-page">
      {isAuthenticated && (
        <div className="greeting-bar">
          <div className="greeting-inner">
            <h2>Hello, {user?.name?.split(" ")[0]} 👋</h2>
            <p>Welcome back to FindIt — browse or post lost &amp; found items</p>
          </div>
        </div>
      )}

      <section className="hero-section">
        {!heroError ? (
          <img
            src="/hero-welcome.png"
            alt="Welcome to FindIt"
            className="hero-image"
            onError={() => setHeroError(true)}
          />
        ) : (
          <div className="hero-fallback">
            <div className="hero-fallback-content">
              <h2>Find What You Lost</h2>
              <p>University Lost &amp; Found — powered by students</p>
              <span className="hero-hint">
                Add your welcome banner at <code>client/public/hero-welcome.png</code>
              </span>
            </div>
          </div>
        )}
      </section>

      <div className="home-container">
        <section className="categories-section">
          <h3>Item Categories</h3>
          <div className="category-pills">
            <button
              type="button"
              className={`category-pill ${activeCategory === "All" ? "active" : ""}`}
              onClick={() => setActiveCategory("All")}
            >
              <span className="pill-icon">🏷️</span> All
            </button>
            {POST_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-pill ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                <span className="pill-icon">{categoryIcons[cat] || "📦"}</span>
                {cat}
              </button>
            ))}
          </div>
        </section>

        <div className="feed-layout">
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            onReset={() => {
              setFilters(defaultFilters);
              setActiveCategory("All");
            }}
          />

          <div className="feed-main">
            <div className="feed-toolbar">
              <div className="feed-tags">
                {activeFilterTags.length > 0 ? (
                  activeFilterTags.map((tag) => (
                    <span key={tag} className="feed-tag">{tag}</span>
                  ))
                ) : (
                  <span className="feed-count">{filteredPosts.length} items</span>
                )}
                {activeFilterTags.length > 0 && (
                  <span className="feed-count">{filteredPosts.length} found</span>
                )}
              </div>

              <div className="feed-sort">
                <label htmlFor="sort">Sort by</label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="title">Title A–Z</option>
                </select>
              </div>
            </div>

        {loading && <div className="feed-status">Loading posts...</div>}

        {!loading && filteredPosts.length === 0 && (
              <div className="feed-empty">
                <span>🔍</span>
                <h3>No items found</h3>
                <p>Try adjusting your filters or search terms</p>
              </div>
            )}

            <div className="post-grid">
              {filteredPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
