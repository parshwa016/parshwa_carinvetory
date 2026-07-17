import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import VehicleCard, { Vehicle } from '../components/VehicleCard';
import VehicleModal from '../components/VehicleModal';
import { filterAndSortVehicles } from '../utils/filters';
import { Car, Plus, Compass, AlertCircle, TrendingUp, Info } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Filters State
  const [filters, setFilters] = useState({
    query: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'price-asc',
  });

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await api.get('/vehicles');
      setVehicles(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vehicles inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handlePurchase = async (id: string) => {
    try {
      const updated = await api.post(`/vehicles/${id}/purchase`, {});
      setVehicles((prev) => prev.map((v) => (v.id === id ? updated : v)));
    } catch (err: any) {
      alert(err.message || 'Purchase failed');
    }
  };

  const handleRestock = async (id: string, qty: number) => {
    try {
      const updated = await api.post(`/vehicles/${id}/restock`, { quantity: qty });
      setVehicles((prev) => prev.map((v) => (v.id === id ? updated : v)));
    } catch (err: any) {
      alert(err.message || 'Restocking failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch (err: any) {
      alert(err.message || 'Deletion failed');
    }
  };

  const handleSaveVehicle = async (vehicleData: Omit<Vehicle, 'id'> & { id?: string }) => {
    if (vehicleData.id) {
      // Update
      const updated = await api.put(`/vehicles/${vehicleData.id}`, vehicleData);
      setVehicles((prev) => prev.map((v) => (v.id === vehicleData.id ? updated : v)));
    } else {
      // Create
      const created = await api.post('/vehicles', vehicleData);
      setVehicles((prev) => [created, ...prev]);
    }
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedVehicle(null);
    setIsModalOpen(true);
  };

  // Filter and Sort Logic (Local for fast UI responsiveness)
  const filteredVehicles = filterAndSortVehicles(vehicles, filters);

  // Calculate inventory statistics
  const totalVehiclesCount = vehicles.reduce((acc, v) => acc + v.quantity, 0);
  const outOfStockCount = vehicles.filter((v) => v.quantity === 0).length;
  const averagePrice = vehicles.length
    ? Math.round(vehicles.reduce((acc, v) => acc + v.price, 0) / vehicles.length)
    : 0;

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Inventory Dashboard
            </h1>
            <p className="text-slate-500 mt-1">
              Browse, search, and manage your premium dealership fleet listings.
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={handleCreateClick}
              className="mt-4 md:mt-0 flex items-center justify-center space-x-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm hover:shadow hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <Plus className="h-5 w-5" />
              <span>Add Vehicle</span>
            </button>
          )}
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Cars Available</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalVehiclesCount} units</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Out of Stock Listings</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{outOfStockCount} models</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Fleet Price</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">${averagePrice.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Filters */}
        <SearchBar filters={filters} onChange={setFilters} />

        {/* Error Messages */}
        {error && (
          <div className="bg-rose-50 text-rose-700 font-semibold p-4 rounded-xl border border-rose-100 mb-8 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Listings Section */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="h-10 w-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Fetching fleet listings...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 py-16 px-6 text-center shadow-sm">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
              <Compass className="h-8 w-8" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-950">No Vehicles Match Your Criteria</h3>
            <p className="text-slate-500 mt-1 max-w-sm mx-auto text-sm">
              Try adjusting your query, filters, or price range inputs to browse other listings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                isAdmin={isAdmin}
                onPurchase={handlePurchase}
                onEdit={handleEditClick}
                onDelete={handleDelete}
                onRestock={handleRestock}
              />
            ))}
          </div>
        )}
      </main>

      {/* Admin Add/Edit Modal */}
      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveVehicle}
        vehicle={selectedVehicle}
      />
    </div>
  );
};
export default Dashboard;
