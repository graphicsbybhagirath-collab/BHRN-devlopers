import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Calendar,
  DollarSign,
  Plus,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Sparkles,
  Search,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = isAuthenticated
    ? [
        { name: 'Dashboard', path: '/dashboard', icon: Compass },
        { name: 'My Trips', path: '/trips', icon: Calendar },
        { name: 'Explore Cities', path: '/cities', icon: MapPin },
        { name: 'Activities', path: '/activities', icon: Sparkles },
        { name: 'Analytics', path: '/admin', icon: BarChart3 },
      ]
    : [
        { name: 'Home', path: '/', icon: Compass },
        { name: 'Explore Cities', path: '/cities', icon: MapPin },
        { name: 'Features', path: '/#features', icon: Sparkles },
        { name: 'Analytics', path: '/admin', icon: BarChart3 },
      ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-ocean-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200">
              <Compass className="w-6 h-6 animate-pulse-slow" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-700 via-brand-600 to-ocean-600 bg-clip-text text-transparent">
                GlobeTrotter
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                PRO
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    active
                      ? 'bg-brand-50 text-brand-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-brand-600' : 'text-slate-400'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/trips/new"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm hover:shadow transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Plan Trip</span>
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1 rounded-full hover:ring-2 hover:ring-brand-500/20 transition-all"
                  >
                    <img
                      src={user?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                      alt={user?.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-brand-500/30"
                    />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-float border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        Profile & Settings
                      </Link>
                      <Link
                        to="/trips"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-slate-400" />
                        My Trips
                      </Link>
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <BarChart3 className="w-4 h-4 text-slate-400" />
                        Admin Analytics
                      </Link>
                      <div className="border-t border-slate-100 my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && (
              <Link
                to="/trips/new"
                className="p-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          {isAuthenticated && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 mb-2">
              <img
                src={user?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div className="overflow-hidden">
                <p className="font-bold text-sm text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    active ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-brand-600' : 'text-slate-400'}`} />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {isAuthenticated ? (
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <UserIcon className="w-5 h-5 text-slate-400" />
                Profile Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 text-left"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold"
              >
                Sign Up Free
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
