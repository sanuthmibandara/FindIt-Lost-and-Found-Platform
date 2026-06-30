import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPostById, updatePost } from "../services/api";
import {
  POST_CATEGORIES,
  POST_TYPES,
  POST_STATUSES,
} from "../utils/categories";
import "./CreatePost.css";

const MAX_IMAGES = 5;

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "Lost",
    category: "",
    location: "",
    dateLostOrFound: "",
    reward: "",
    status: "Open",
  });
  const [images, setImages] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchPost = async () => {
      try {
        const res = await getPostById(id);
        const post = res.data;

        const ownerId = post.owner?._id || post.owner?.id || post.owner;
        if (ownerId?.toString() !== user?.id?.toString()) {
          navigate("/my-posts");
          return;
        }

        setForm({
          title: post.title,
          description: post.description,
          type: post.type,
          category: post.category,
          location: post.location,
          dateLostOrFound: new Date(post.dateLostOrFound)
            .toISOString()
            .split("T")[0],
          reward: post.reward?.replace(/^LKR\s*/i, "") || "",
          status: post.status || "Open",
        });

        setImages(
          (post.images || []).map((url) => ({
            url,
            preview: url,
            isExisting: true,
          }))
        );
      } catch {
        setApiError("Failed to load post.");
      } finally {
        setFetching(false);
      }
    };

    fetchPost();
  }, [id, isAuthenticated, navigate, user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };

  const handleTypeChange = (type) => {
    setForm((prev) => ({ ...prev, type }));
    setErrors((prev) => ({ ...prev, type: "" }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = MAX_IMAGES - images.length;
    const toAdd = files.slice(0, remaining);

    const newImages = toAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isExisting: false,
    }));

    setImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImages((prev) => {
      const item = prev[index];
      if (!item.isExisting) URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== index);
    });
    setActiveImage((prev) => (prev >= index && prev > 0 ? prev - 1 : prev));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (!form.type) newErrors.type = "Please select Lost or Found";
    if (!form.category) newErrors.category = "Category is required";
    if (!form.location.trim()) newErrors.location = "Location is required";
    if (!form.dateLostOrFound) newErrors.dateLostOrFound = "Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("description", form.description.trim());
    formData.append("type", form.type);
    formData.append("category", form.category);
    formData.append("location", form.location.trim());
    formData.append("dateLostOrFound", form.dateLostOrFound);
    formData.append("status", form.status);
    if (form.reward.trim()) {
      formData.append("reward", `LKR ${form.reward.trim()}`);
    } else {
      formData.append("reward", "");
    }

    const keptUrls = images.filter((img) => img.isExisting).map((img) => img.url);
    formData.append("existingImages", JSON.stringify(keptUrls));

    images
      .filter((img) => !img.isExisting && img.file)
      .forEach((img) => formData.append("images", img.file));

    setLoading(true);
    try {
      await updatePost(id, formData);
      navigate("/my-posts");
    } catch (err) {
      setApiError(
        err.response?.data?.message || "Failed to update post. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  if (fetching) {
    return (
      <div className="create-post-page">
        <div className="create-post-card" style={{ padding: "3rem", textAlign: "center" }}>
          Loading post...
        </div>
      </div>
    );
  }

  return (
    <div className="create-post-page">
      <div className="create-post-card">
        <div className="create-post-header">
          <div>
            <h1>Edit Post</h1>
            <p>Update your lost or found listing</p>
          </div>
          <button
            type="button"
            className="create-post-close"
            onClick={() => navigate("/my-posts")}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <form className="create-post-form" onSubmit={handleSubmit}>
          {apiError && <div className="form-alert error">{apiError}</div>}

          <div className="create-post-grid">
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="title">
                  Title <span className="required">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  className={errors.title ? "input-error" : ""}
                />
                {errors.title && <p className="field-error">{errors.title}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  Description <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className={errors.description ? "input-error" : ""}
                />
                {errors.description && (
                  <p className="field-error">{errors.description}</p>
                )}
              </div>

              <div className="form-group media-section">
                <label>Images</label>
                <div className="media-preview-main">
                  {images.length > 0 ? (
                    <img
                      src={images[activeImage]?.preview}
                      alt={`Preview ${activeImage + 1}`}
                    />
                  ) : (
                    <div className="media-placeholder">
                      <span>📷</span>
                      No images — add photos below
                    </div>
                  )}
                </div>

                <div className="media-thumbnails">
                  {images.map((img, index) => (
                    <div
                      key={img.preview + index}
                      className={`media-thumb ${activeImage === index ? "active" : ""}`}
                      onClick={() => setActiveImage(index)}
                    >
                      <img src={img.preview} alt={`Thumbnail ${index + 1}`} />
                      <button
                        type="button"
                        className="media-thumb-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}

                  {images.length < MAX_IMAGES && (
                    <button
                      type="button"
                      className="media-add-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      +
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden-input"
                  onChange={handleImageSelect}
                />
                <p className="media-hint">
                  Up to {MAX_IMAGES} images, max 5MB each
                </p>
              </div>
            </div>

            <div className="form-section">
              <div className="form-group">
                <label>
                  Type <span className="required">*</span>
                </label>
                <div className="type-options">
                  {POST_TYPES.map((type) => (
                    <div key={type} className="type-option">
                      <input
                        type="radio"
                        id={`edit-type-${type}`}
                        name="type"
                        checked={form.type === type}
                        onChange={() => handleTypeChange(type)}
                      />
                      <label htmlFor={`edit-type-${type}`}>{type}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="category">
                  Category <span className="required">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={errors.category ? "input-error" : ""}
                >
                  <option value="">Select a category</option>
                  {POST_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="field-error">{errors.category}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="location">
                  Location <span className="required">*</span>
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={form.location}
                  onChange={handleChange}
                  className={errors.location ? "input-error" : ""}
                />
                {errors.location && (
                  <p className="field-error">{errors.location}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="dateLostOrFound">
                  Date Lost / Found <span className="required">*</span>
                </label>
                <input
                  id="dateLostOrFound"
                  name="dateLostOrFound"
                  type="date"
                  value={form.dateLostOrFound}
                  onChange={handleChange}
                  className={errors.dateLostOrFound ? "input-error" : ""}
                />
                {errors.dateLostOrFound && (
                  <p className="field-error">{errors.dateLostOrFound}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  {POST_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="reward">Reward (optional)</label>
                <div className="reward-input">
                  <span className="reward-prefix">LKR</span>
                  <input
                    id="reward"
                    name="reward"
                    type="text"
                    placeholder="e.g. 500"
                    value={form.reward}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="create-post-footer">
            <button
              type="button"
              className="btn-discard"
              onClick={() => navigate("/my-posts")}
            >
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPost;
