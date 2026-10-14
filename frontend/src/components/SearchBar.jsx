import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Books', 'Home'];

export const SearchBar = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedSort,
  setSelectedSort,
  onClear,
}) => {
  return (
    <div className="filter-bar">
      <div className="filter-bar-top">
        {/* Search Input Box */}
        <div className="search-box">
          <Search className="input-icon" size={18} />
          <input
            type="text"
            id="product-search-input"
            className="search-input"
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sort Dropdown (Bonus Challenge) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SlidersHorizontal size={16} color="var(--text-muted)" />
          <select
            id="product-sort-select"
            className="sort-select"
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
          >
            <option value="">Sort By: Featured / Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="categories-pills">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            className={`category-pill ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
            id={`category-pill-${category.toLowerCase()}`}
          >
            {category}
          </button>
        ))}

        {(searchTerm || selectedCategory !== 'All' || selectedSort) && (
          <button
            type="button"
            onClick={onClear}
            className="btn btn-secondary btn-sm"
            style={{ marginLeft: 'auto' }}
          >
            <X size={14} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
