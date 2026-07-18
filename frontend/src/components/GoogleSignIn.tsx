import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { X, Shield, User, Loader2 } from 'lucide-react';

interface MockGoogleAccount {
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  avatar: string;
}

const MOCK_ACCOUNTS: MockGoogleAccount[] = [
  {
    email: 'alex.admin@gmail.com',
    name: 'Alex Rivera (Admin)',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80',
  },
  {
    email: 'john.buyer@gmail.com',
    name: 'John Miller (Customer)',
    role: 'USER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&q=80',
  },
];

export const GoogleSignIn: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSelectAccount = async (account: MockGoogleAccount) => {
    setLoading(account.email);
    setError('');

    try {
      // Simulate OAuth network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const data = await api.post('/auth/google', {
        email: account.email,
        role: account.role,
      });

      login(data.token, data.user);
      setIsOpen(false);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      {/* Official styled Google Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition active:scale-[0.99] shadow-sm"
      >
        <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Google Account Chooser Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl border border-slate-100 shadow-2xl overflow-hidden transform transition-all p-6">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex flex-col">
                {/* Simulated Google Logo */}
                <span className="font-extrabold text-lg tracking-tight flex items-center">
                  <span className="text-[#4285F4]">G</span>
                  <span className="text-[#EA4335]">o</span>
                  <span className="text-[#FBBC05]">o</span>
                  <span className="text-[#4285F4]">g</span>
                  <span className="text-[#34A853]">l</span>
                  <span className="text-[#EA4335]">e</span>
                </span>
                <p className="text-xs text-slate-500 mt-1 font-medium">Choose an account to continue to DriveSelect</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-rose-50 text-rose-700 text-xs font-semibold p-3 rounded-lg border border-rose-100 mt-4">
                {error}
              </div>
            )}

            {/* Accounts List */}
            <div className="mt-4 space-y-3">
              {MOCK_ACCOUNTS.map((account) => {
                const isSelectedLoading = loading === account.email;
                return (
                  <button
                    key={account.email}
                    onClick={() => handleSelectAccount(account)}
                    disabled={loading !== null}
                    className="w-full flex items-center justify-between p-3.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 rounded-xl transition text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      {/* Avatar */}
                      <div className="relative">
                        <img
                          src={account.avatar}
                          alt={account.name}
                          className="h-10 w-10 rounded-full object-cover border border-slate-100 shadow-sm"
                        />
                        <div className={`absolute -bottom-1 -right-1 p-0.5 rounded-full text-white ${
                          account.role === 'ADMIN' ? 'bg-indigo-600' : 'bg-blue-600'
                        }`}>
                          {account.role === 'ADMIN' ? (
                            <Shield className="h-2.5 w-2.5" />
                          ) : (
                            <User className="h-2.5 w-2.5" />
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition">
                          {account.name}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">{account.email}</p>
                      </div>
                    </div>

                    {isSelectedLoading && (
                      <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-medium">
              <span>DriveSelect OAuth Sandbox</span>
              <a href="#" className="hover:text-blue-600 transition">Privacy Policy</a>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
export default GoogleSignIn;
