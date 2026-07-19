import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import Navbar from '../components/Navbar';
import VehicleModal from '../components/VehicleModal';
import type { Vehicle } from '../components/VehicleCard';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Plus, Edit2, Trash2, AlertTriangle, ArrowLeft, Layers } from 'lucide-react';

interface Transaction {
  id: string;
  userEmail: string;
  vehicleMake: string;
  vehicleModel: string;
  pricePaid: number;
  purchasedAt: string;
}

export const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    // Role protection - redirect if not ADMIN
    if (user && user.role !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await api.get('/vehicles');
      setVehicles(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const data = await api.get('/vehicles/transactions');
      setTransactions(data);
    } catch (err: any) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setTransactionsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchTransactions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
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

  // Find low stock items (qty <= 2)
  const lowStockCount = vehicles.filter((v) => v.quantity <= 2).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <Shield className="h-8 w-8 text-indigo-600" />
              <span>Admin Hub</span>
            </h1>
            <p className="text-slate-500 mt-1">
              Add new listings, edit attributes, restock stock levels, and delete entries.
            </p>
          </div>
          <button
            onClick={handleCreateClick}
            className="mt-4 md:mt-0 flex items-center justify-center space-x-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm hover:shadow hover:scale-[1.01] transition-all"
          >
            <Plus className="h-5 w-5" />
            <span>New Listing</span>
          </button>
        </div>

        {/* Warning card for low stock */}
        {lowStockCount > 0 && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-8 flex items-start space-x-3 text-indigo-900 shadow-sm">
            <AlertTriangle className="h-6 w-6 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold">Inventory Stock Warning</h4>
              <p className="text-sm text-indigo-800/90 mt-1 leading-relaxed">
                There are currently <strong>{lowStockCount}</strong> vehicle models with low stock or out of stock levels (2 units or less). Ensure these are restocked to keep them purchase-ready.
              </p>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {error && (
            <div className="bg-rose-50 text-rose-700 text-sm font-semibold p-4 border-b border-rose-100">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="h-10 w-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-slate-500 font-medium">Fetching details...</p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Layers className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="font-bold">No vehicles in inventory.</p>
              <button
                onClick={handleCreateClick}
                className="mt-4 text-sm font-bold text-indigo-600 hover:underline"
              >
                Create your first vehicle listing
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">Vehicle Details</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {vehicles.map((v) => {
                    const isOutOfStock = v.quantity === 0;
                    const isLowStock = v.quantity <= 2 && !isOutOfStock;
                    return (
                      <tr key={v.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="font-black text-slate-900 text-base">
                            {v.make} <span className="font-medium text-slate-600">{v.model}</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">ID: {v.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                            {v.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-extrabold text-slate-900 text-base">
                          ${v.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-100">
                              <span>Out of Stock</span>
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-100">
                              <span>Low Stock ({v.quantity})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              <span>{v.quantity} Available</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEditClick(v)}
                              className="p-2 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 rounded-xl transition"
                              title="Edit Listing"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(v.id)}
                              className="p-2 border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 rounded-xl transition"
                              title="Delete Listing"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Purchase History Log Section */}
          <div className="mt-12 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl border border-indigo-100 shadow-sm">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Recent Purchase Logs</h2>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Audit history of all vehicles purchased by customers.</p>
              </div>
            </div>

            {transactionsLoading ? (
              <div className="flex items-center justify-center h-32 text-slate-400 font-bold">
                Loading transaction history...
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                <p className="font-bold">No transactions found</p>
                <p className="text-xs mt-1">Purchased items will appear here automatically.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                  <thead className="bg-slate-50/70 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Buyer Email</th>
                      <th className="px-6 py-4">Vehicle Model</th>
                      <th className="px-6 py-4">Price Paid</th>
                      <th className="px-6 py-4">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700 bg-white">
                    {transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 font-bold text-slate-900">{t.userEmail}</td>
                        <td className="px-6 py-4">
                          {t.vehicleMake} <span className="font-normal text-slate-500">{t.vehicleModel}</span>
                        </td>
                        <td className="px-6 py-4 font-black text-slate-900">
                          ${t.pricePaid.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {new Date(t.purchasedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
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
export default AdminPanel;
