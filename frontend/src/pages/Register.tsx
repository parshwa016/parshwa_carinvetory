import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Car, Lock, Mail, ArrowRight, Loader2, Shield, User, UserPlus } from 'lucide-react';
import GoogleSignIn from '../components/GoogleSignIn';

const CAROUSEL_IMAGES = [
  '/cars/porsche_911_carrera.jpg',
  '/cars/lamborghini_huracan.jpg',
  '/cars/bmw_m4_competition.jpg',
  '/cars/aston_martin_vantage.jpg',
];

export const Register: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('register'); // Initialized to 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Carousel Image Index
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.post('/auth/login', { email, password });
      login(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.post('/auth/register', { email, password, role });
      login(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900 overflow-hidden font-sans">
      
      {/* LEFT COLUMN: Animated Visual Brand Showcase (Car Carousel) */}
      <div className="hidden lg:flex lg:w-3/5 relative flex-col justify-between p-12 overflow-hidden text-white">
        
        {/* Background Image Carousel with Fades */}
        {CAROUSEL_IMAGES.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out transform ${
              index === imageIndex ? 'opacity-40 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}

        {/* Ambient Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-slate-950/20 z-0"></div>

        {/* Logo Header */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-md border border-blue-500/20">
            <Car className="h-6 w-6" />
          </div>
          <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            DriveSelect
          </span>
        </div>

        {/* Glassmorphic Value Statement */}
        <div className="relative z-10 max-w-xl bg-white/5 border border-white/15 backdrop-blur-md p-8 rounded-3xl shadow-2xl mt-auto mb-8">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/25">
            Premium Dealership Ecosystem
          </span>
          <h1 className="text-4xl font-extrabold text-white mt-4 tracking-tight leading-tight">
            Manage your high-performance fleet seamlessly.
          </h1>
          <p className="text-sm text-slate-300 mt-3 font-medium leading-relaxed">
            Experience complete control over listings, inventory audits, and sales metrics, backed by modern Test-Driven Development (TDD) principles.
          </p>
        </div>

        {/* Stats Panel */}
        <div className="relative z-10 grid grid-cols-3 gap-6 bg-slate-950/40 border border-white/5 backdrop-blur-sm rounded-2xl p-6">
          <div>
            <h4 className="text-xl font-black text-white">24</h4>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">Luxury Models</p>
          </div>
          <div>
            <h4 className="text-xl font-black text-white">37</h4>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">TDD Test Suites</p>
          </div>
          <div>
            <h4 className="text-xl font-black text-white">100%</h4>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">SQLite Persistence</p>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Form Panel (Login / Register Tabbed Interface) */}
      <div className="w-full lg:w-2/5 bg-white flex flex-col justify-center px-6 sm:px-12 xl:px-16 relative overflow-y-auto z-10 py-12">
        <div className="mx-auto w-full max-w-md">
          
          {/* Logo showing on mobile */}
          <div className="flex items-center space-x-2 lg:hidden mb-6">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-sm">
              <Car className="h-5 w-5" />
            </div>
            <span className="font-black text-xl text-slate-900">DriveSelect</span>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Get Started
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Access your inventory management ecosystem.
          </p>

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-50 text-rose-700 text-xs font-semibold p-3.5 rounded-xl border border-rose-100 mt-6 shadow-sm">
              {error}
            </div>
          )}

          {/* TAB SYSTEM */}
          <div className="flex border-b border-slate-100 mt-6 mb-8">
            <button
              onClick={() => {
                setActiveTab('login');
                setError('');
              }}
              className={`flex-1 pb-4 text-sm font-bold border-b-2 transition ${
                activeTab === 'login'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setError('');
              }}
              className={`flex-1 pb-4 text-sm font-bold border-b-2 transition ${
                activeTab === 'register'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* FORMS CONTAINER */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-sm active:scale-[0.98] transition-all"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Account Role (For Evaluation Purposes)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('USER')}
                    className={`flex items-center justify-center space-x-2 py-3 border rounded-xl text-sm font-semibold transition ${
                      role === 'USER'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span>Standard User</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('ADMIN')}
                    className={`flex items-center justify-center space-x-2 py-3 border rounded-xl text-sm font-semibold transition ${
                      role === 'ADMIN'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin User</span>
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-slate-400 italic">
                  * Select **Admin User** to enable listing modifications, restocking and deletions.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-sm active:scale-[0.98] transition-all"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Register & Sign In</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Social Google Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
              <span className="bg-white px-2 text-slate-400">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-in widget */}
          <GoogleSignIn />

          {/* Quick Sandbox Help Panel */}
          <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50/50 rounded-2xl p-4 border border-slate-200/50">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Developer Info / Sandbox Access
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              You can toggle between **Sign In** and **Create Account** to test standard logic, or use **Continue with Google** to test the OAuth sandbox account chooser.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
export default Register;
