import type { Vehicle } from '../components/VehicleCard';

interface SearchFilters {
  query: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
}

export const filterAndSortVehicles = (vehicles: Vehicle[], filters: SearchFilters): Vehicle[] => {
  return vehicles
    .filter((v) => {
      const matchesQuery =
        v.make.toLowerCase().includes(filters.query.toLowerCase()) ||
        v.model.toLowerCase().includes(filters.query.toLowerCase());
      const matchesCategory = filters.category ? v.category === filters.category : true;
      const matchesMinPrice = filters.minPrice ? v.price >= parseFloat(filters.minPrice) : true;
      const matchesMaxPrice = filters.maxPrice ? v.price <= parseFloat(filters.maxPrice) : true;

      return matchesQuery && matchesCategory && matchesMinPrice && matchesMaxPrice;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      if (filters.sortBy === 'name-asc') return `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`);
      if (filters.sortBy === 'name-desc') return `${b.make} ${b.model}`.localeCompare(`${a.make} ${a.model}`);
      return 0;
    });
};
