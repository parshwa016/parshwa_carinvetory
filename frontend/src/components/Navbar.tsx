import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, LogOut, Shield, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Car className="h-6 w-6" />
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                DriveSelect
              </span>
            </Link>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <UserIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{user.email}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-200 text-slate-700">
                  {user.role}
                </span>
              </div>

              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-1 px-4 py-2 border border-transparent rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin Hub</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
