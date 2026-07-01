import { useState } from "react";
import "./ClaimModal.css";

const initialAnswers = {
  describeItem: "",
  location: "",
  identifyingMarks: "",
  additionalInfo: "",
};

function ClaimModal({ postTitle, onClose, onSubmit, loading }) {
  const [answers, setAnswers] = useState(initialAnswers);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnswers((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!answers.describeItem.trim()) {
      newErrors.describeItem = "Please describe the item";
    }
    if (!answers.location.trim()) {
      newErrors.location = "Please answer the location question";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(answers);
  };

  return (
    <div className="claim-modal-overlay" onClick={onClose}>
      <div className="claim-modal" onClick={(e) => e.stopPropagation()}>
        <div className="claim-modal-header">
          <div>
            <h2>Claim Item</h2>
            <p>Answer verification questions for: <strong>{postTitle}</strong></p>
          </div>
          <button type="button" className="claim-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="claim-field">
            <label htmlFor="describeItem">
              Describe the item <span className="required">*</span>
            </label>
            <textarea
              id="describeItem"
              name="describeItem"
              rows={3}
              placeholder="What does the item look like? Include color, brand, size..."
              value={answers.describeItem}
              onChange={handleChange}
              className={errors.describeItem ? "input-error" : ""}
            />
            {errors.describeItem && (
              <span className="field-error">{errors.describeItem}</span>
            )}
          </div>

          <div className="claim-field">
            <label htmlFor="location">
              Where exactly did you lose or find it? <span className="required">*</span>
            </label>
            <textarea
              id="location"
              name="location"
              rows={2}
              placeholder="Be specific — building, floor, room, time of day..."
              value={answers.location}
              onChange={handleChange}
              className={errors.location ? "input-error" : ""}
            />
            {errors.location && (
              <span className="field-error">{errors.location}</span>
            )}
          </div>

          <div className="claim-field">
            <label htmlFor="identifyingMarks">Any identifying marks?</label>
            <input
              id="identifyingMarks"
              name="identifyingMarks"
              type="text"
              placeholder="Scratches, stickers, engravings, unique features..."
              value={answers.identifyingMarks}
              onChange={handleChange}
            />
          </div>

          <div className="claim-field">
            <label htmlFor="additionalInfo">Anything else to prove ownership?</label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              rows={2}
              placeholder="Contents of wallet, serial number, case details..."
              value={answers.additionalInfo}
              onChange={handleChange}
            />
          </div>

          <div className="claim-modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Claim"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClaimModal;
