import { POST_CATEGORIES, POST_TYPES } from "../../utils/categories";
import "./FilterSidebar.css";

function FilterSidebar({ filters, onChange, onReset }) {
  const handleTypeToggle = (type) => {
    const types = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    onChange({ ...filters, types });
  };

  const handleCategoryToggle = (category) => {
    const categories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onChange({ ...filters, categories });
  };

  return (
    <aside className="filter-sidebar">
      <div className="filter-header">
        <h3>Filter</h3>
        <button type="button" className="filter-reset" onClick={onReset}>
          Reset
        </button>
      </div>

      <div className="filter-section">
        <h4>Type</h4>
        {POST_TYPES.map((type) => (
          <label key={type} className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters.types.includes(type)}
              onChange={() => handleTypeToggle(type)}
            />
            <span className={`type-dot ${type.toLowerCase()}`} />
            {type}
          </label>
        ))}
      </div>

      <div className="filter-section">
        <h4>Category</h4>
        <div className="filter-categories">
          {POST_CATEGORIES.map((cat) => (
            <label key={cat} className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.categories.includes(cat)}
                onChange={() => handleCategoryToggle(cat)}
              />
              {cat}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4>Status</h4>
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filters.openOnly}
            onChange={(e) =>
              onChange({ ...filters, openOnly: e.target.checked })
            }
          />
          Open items only
        </label>
      </div>
    </aside>
  );
}

export default FilterSidebar;
