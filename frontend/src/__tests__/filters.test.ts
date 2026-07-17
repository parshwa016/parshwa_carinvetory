import { describe, it, expect } from 'vitest';
import { filterAndSortVehicles } from '../utils/filters';
import { Vehicle } from '../components/VehicleCard';

describe('filterAndSortVehicles Utility', () => {
  const mockVehicles: Vehicle[] = [
    { id: '1', make: 'Toyota', model: 'Camry', category: 'Sedan', price: 28000, quantity: 2 },
    { id: '2', make: 'Honda', model: 'Civic', category: 'Sedan', price: 25000, quantity: 5 },
    { id: '3', make: 'Ford', model: 'F-150', category: 'Truck', price: 45000, quantity: 1 },
    { id: '4', make: 'Toyota', model: 'RAV4', category: 'SUV', price: 32000, quantity: 0 },
  ];

  it('should filter by search query (make or model)', () => {
    const filters = { query: 'toyota', category: '', minPrice: '', maxPrice: '', sortBy: 'price-asc' };
    const result = filterAndSortVehicles(mockVehicles, filters);
    
    expect(result.length).toBe(2);
    expect(result.some(v => v.model === 'Camry')).toBe(true);
    expect(result.some(v => v.model === 'RAV4')).toBe(true);
  });

  it('should filter by category', () => {
    const filters = { query: '', category: 'Sedan', minPrice: '', maxPrice: '', sortBy: 'price-asc' };
    const result = filterAndSortVehicles(mockVehicles, filters);

    expect(result.length).toBe(2);
    expect(result.every(v => v.category === 'Sedan')).toBe(true);
  });

  it('should filter by price range', () => {
    const filters = { query: '', category: '', minPrice: '26000', maxPrice: '35000', sortBy: 'price-asc' };
    const result = filterAndSortVehicles(mockVehicles, filters);

    // Camry (28k) and RAV4 (32k) are in this range
    expect(result.length).toBe(2);
    expect(result[0].price).toBe(28000);
    expect(result[1].price).toBe(32000);
  });

  it('should sort by price ascending', () => {
    const filters = { query: '', category: '', minPrice: '', maxPrice: '', sortBy: 'price-asc' };
    const result = filterAndSortVehicles(mockVehicles, filters);

    expect(result[0].price).toBe(25000); // Civic
    expect(result[1].price).toBe(28000); // Camry
    expect(result[2].price).toBe(32000); // RAV4
    expect(result[3].price).toBe(45000); // F-150
  });

  it('should sort by price descending', () => {
    const filters = { query: '', category: '', minPrice: '', maxPrice: '', sortBy: 'price-desc' };
    const result = filterAndSortVehicles(mockVehicles, filters);

    expect(result[0].price).toBe(45000); // F-150
    expect(result[3].price).toBe(25000); // Civic
  });

  it('should sort alphabetically', () => {
    const filters = { query: '', category: '', minPrice: '', maxPrice: '', sortBy: 'name-asc' };
    const result = filterAndSortVehicles(mockVehicles, filters);

    expect(result[0].make + ' ' + result[0].model).toBe('Ford F-150');
    expect(result[1].make + ' ' + result[1].model).toBe('Honda Civic');
    expect(result[2].make + ' ' + result[2].model).toBe('Toyota Camry');
  });
});
