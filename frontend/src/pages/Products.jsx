import React, { useState, useEffect } from 'react';
import { ShoppingBag, RefreshCw, AlertCircle, PackageX } from 'lucide-react';
import { getAllProductsApi } from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (selectedSort) {
        params.sort = selectedSort;
      }

      const res = await getAllProductsApi(params);
      if (res.data && Array.isArray(res.data.products)) {
        setProducts(res.data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Fetch Products Error:', err);
      setError('Something went wrong while loading products.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced/responsive fetch whenever search, category, or sort changes
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts();
    }, 250);

    return () => clearTimeout(handler);
  }, [searchTerm, selectedCategory, selectedSort]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedSort('');
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="catalog-header">
        <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
          Real-Time Inventory
        </span>
        <h1 className="catalog-title">Explore Our Catalog</h1>
        <p className="catalog-desc">
          Browse through our curated collection of premium products. Search by name, filter by department, and find exactly what you need.
        </p>
      </div>

      {/* Search & Filter Component */}
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSort={selectedSort}
        setSelectedSort={setSelectedSort}
        onClear={handleClearFilters}
      />

      {/* State Rendering */}
      {loading ? (
        <div className="state-box" id="products-loading-state">
          <div className="spinner"></div>
          <h3 className="state-title">Loading products...</h3>
          <p className="state-desc">Fetching latest inventory from ShopKart backend</p>
        </div>
      ) : error ? (
        <div className="state-box" id="products-error-state">
          <div className="state-icon" style={{ color: 'var(--error)' }}>
            <AlertCircle size={48} />
          </div>
          <h3 className="state-title">Something went wrong while loading products.</h3>
          <p className="state-desc">{error}</p>
          <button onClick={fetchProducts} className="btn btn-primary" id="retry-fetch-btn">
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="state-box" id="products-empty-state">
          <div className="state-icon" style={{ color: 'var(--warning)' }}>
            <PackageX size={48} />
          </div>
          <h3 className="state-title">No products found.</h3>
          <p className="state-desc">
            We couldn't find any products matching your current search criteria.
          </p>
          <button onClick={handleClearFilters} className="btn btn-secondary">
            Reset Filters & View All
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              Showing <strong>{products.length}</strong> {products.length === 1 ? 'product' : 'products'}
            </p>
          </div>

          {/* Dynamic Products Grid */}
          <div className="products-grid" id="products-container">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Products;
