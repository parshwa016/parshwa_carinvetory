import React from 'react';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface SearchFilters {
  query: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
}

interface SearchBarProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}

const CATEGORIES = ['All Categories', 'Sedan', 'SUV', 'Coupe', 'Truck', 'Hatchback', 'Convertible', 'Electric'];

export const SearchBar: React.FC<SearchBarProps> = ({ filters, onChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({
      ...filters,
      [name]: value,
    });
  };

  const handleReset = () => {
    onChange({
      query: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'price-asc',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2 text-slate-800 font-bold">
          <SlidersHorizontal className="h-5 w-5 text-blue-600" />
          <span>Filter Inventory</span>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center space-x-1 text-sm font-semibold text-slate-500 hover:text-blue-600 transition"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            name="query"
            placeholder="Search make or model..."
            value={filters.query}
            onChange={handleInputChange}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            name="category"
            value={filters.category}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition appearance-none bg-no-repeat bg-[right_12px_center] bg-[length:16px]"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat === 'All Categories' ? '' : cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price */}
        <div>
          <input
            type="number"
            name="minPrice"
            placeholder="Min Price ($)"
            value={filters.minPrice}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        {/* Max Price */}
        <div>
          <input
            type="number"
            name="maxPrice"
            placeholder="Max Price ($)"
            value={filters.maxPrice}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        {/* Sort Option */}
        <div>
          <select
            name="sortBy"
            value={filters.sortBy}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          >
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Alphabetical (A-Z)</option>
            <option value="name-desc">Alphabetical (Z-A)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
export default SearchBar;
