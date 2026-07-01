import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { createPost } from "../services/api";
import { getErrorMessage } from "../utils/errorMessages";
import { validateImageFiles } from "../utils/validateImage";
import { POST_CATEGORIES, POST_TYPES } from "../utils/categories";
import "./CreatePost.css";

const MAX_IMAGES = 5;

const initialForm = {
  title: "",
  description: "",
  type: "Lost",
  category: "",
  location: "",
  dateLostOrFound: "",
  reward: "",
};

function CreatePost() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleTypeChange = (type) => {
    setForm((prev) => ({ ...prev, type }));
    setErrors((prev) => ({ ...prev, type: "" }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const imageCheck = validateImageFiles(files);
    if (!imageCheck.valid) {
      toast.error(imageCheck.message);
      e.target.value = "";
      return;
    }

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      toast.warning(`You can upload up to ${MAX_IMAGES} images per post.`);
      e.target.value = "";
      return;
    }

    const toAdd = files.slice(0, remaining);
    if (files.length > remaining) {
      toast.info(`Only ${remaining} more image(s) were added (max ${MAX_IMAGES}).`);
    }

    const newImages = toAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index].preview);
      return updated;
    });
    setActiveImage((prev) => (prev >= index && prev > 0 ? prev - 1 : prev));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim())
      newErrors.description = "Description is required";
    if (!form.type) newErrors.type = "Please select Lost or Found";
    if (!form.category) newErrors.category = "Category is required";
    if (!form.location.trim()) newErrors.location = "Location is required";
    if (!form.dateLostOrFound)
      newErrors.dateLostOrFound = "Date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("description", form.description.trim());
    formData.append("type", form.type);
    formData.append("category", form.category);
    formData.append("location", form.location.trim());
    formData.append("dateLostOrFound", form.dateLostOrFound);
    if (form.reward.trim()) {
      formData.append("reward", `LKR ${form.reward.trim()}`);
    }

    images.forEach((img) => {
      formData.append("images", img.file);
    });

    setLoading(true);
    try {
      await createPost(formData);
      toast.success("Post published successfully!");
      navigate("/");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create post. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="create-post-page">
      <div className="create-post-card">
        <div className="create-post-header">
          <div>
            <h1>Create New Post</h1>
            <p>Report a lost or found item for the university community</p>
          </div>
          <button
            type="button"
            className="create-post-close"
            onClick={() => navigate("/")}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <form className="create-post-form" onSubmit={handleSubmit}>
          <div className="create-post-grid">
            {/* Left column */}
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="title">
                  Title <span className="required">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g. Lost MacBook Charger"
                  value={form.title}
                  onChange={handleChange}
                  className={errors.title ? "input-error" : ""}
                />
                {errors.title && (
                  <p className="field-error">{errors.title}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  Description <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe the item, distinguishing features, and any helpful details..."
                  value={form.description}
                  onChange={handleChange}
                  className={errors.description ? "input-error" : ""}
                />
                {errors.description && (
                  <p className="field-error">{errors.description}</p>
                )}
              </div>

              <div className="form-group media-section">
                <label>
                  Images <span className="required">(optional)</span>
                </label>

                <div className="media-preview-main">
                  {images.length > 0 ? (
                    <img
                      src={images[activeImage]?.preview}
                      alt={`Preview ${activeImage + 1}`}
                    />
                  ) : (
                    <div className="media-placeholder">
                      <span>📷</span>
                      Add photos to help identify the item
                    </div>
                  )}
                </div>

                <div className="media-thumbnails">
                  {images.map((img, index) => (
                    <div
                      key={img.preview}
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

            {/* Right column */}
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
                        id={`type-${type}`}
                        name="type"
                        checked={form.type === type}
                        onChange={() => handleTypeChange(type)}
                      />
                      <label htmlFor={`type-${type}`}>{type}</label>
                    </div>
                  ))}
                </div>
                {errors.type && <p className="field-error">{errors.type}</p>}
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
                  placeholder="e.g. Main Library, 2nd Floor"
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
              onClick={() => navigate("/")}
            >
              Discard
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Publishing..." : "Publish Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
