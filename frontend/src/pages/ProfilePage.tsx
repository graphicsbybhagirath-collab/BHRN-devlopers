import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User as UserIcon, Mail, Globe, Lock, Shield, Trash2, Heart, MapPin, Compass, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { cityService } from '../services/api';
import { City } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, updateUser, deleteAccount } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState('English');
  const [profileImage, setProfileImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Saved destinations
  const [savedCities, setSavedCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setLanguage(user.language || 'English');
      setProfileImage(user.profile_image || '');
    }
    loadSavedCities();
  }, [user]);

  const loadSavedCities = async () => {
    try {
      setLoadingCities(true);
      const raw = localStorage.getItem('globetrotter_saved_cities');
      const savedIds: number[] = raw ? JSON.parse(raw) : [1, 2, 3]; // Default to top popular if empty
      const allCities = await cityService.getCities();
      const matched = allCities.filter((c) => savedIds.includes(c.id));
      setSavedCities(matched.length > 0 ? matched : allCities.slice(0, 3));
    } catch (err) {
      console.error('Failed to load saved destinations', err);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleRemoveSavedCity = (cityId: number) => {
    const next = savedCities.filter((c) => c.id !== cityId);
    setSavedCities(next);
    localStorage.setItem('globetrotter_saved_cities', JSON.stringify(next.map((c) => c.id)));
    toast.info('Removed', 'Destination removed from your saved list.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Validation Error', 'Name cannot be empty.');
      return;
    }
    if (password && password.length < 6) {
      toast.error('Validation Error', 'Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateUser({
        name: name.trim(),
        email: email.trim(),
        password: password.trim() || undefined,
        language,
        profile_image: profileImage || undefined,
      });
      setPassword('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmation = window.prompt(
      'Are you sure you want to permanently delete your account and all trips? Type "DELETE" to confirm.'
    );
    if (confirmation === 'DELETE') {
      await deleteAccount();
      navigate('/login');
    }
  };

  const AVATAR_PRESETS = [
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Alex`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Emma`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Leo`,
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Account & Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal profile, languages, and saved dream destinations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Profile Card Left (4 cols) */}
        <div className="md:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <img
              src={profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-brand-500/30 shadow-md"
            />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">
              GlobeTrotter Explorer
            </span>
          </div>

          {/* Preset Avatars */}
          <div className="w-full pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Choose Avatar
            </span>
            <div className="flex justify-center gap-2">
              {AVATAR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setProfileImage(preset)}
                  className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${
                    profileImage === preset ? 'border-brand-600 ring-2 ring-brand-200' : 'border-transparent'
                  }`}
                >
                  <img src={preset} alt="preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form Right (8 cols) */}
        <div className="md:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20"
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                New Password (Optional)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave empty to keep current password"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Language Preference
              </label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 bg-white"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Español (Spanish)</option>
                  <option value="French">Français (French)</option>
                  <option value="German">Deutsch (German)</option>
                  <option value="Japanese">日本語 (Japanese)</option>
                  <option value="Hindi">हिन्दी (Hindi)</option>
                </select>
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>

          {/* Saved Destinations Wishlist */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  Saved Dream Destinations
                </h4>
                <p className="text-[11px] text-slate-500">Your bookmarked cities for upcoming trips</p>
              </div>
              <Link
                to="/cities"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>Browse More</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {savedCities.map((c) => (
                <div
                  key={c.id}
                  className="relative rounded-2xl border border-slate-100 overflow-hidden shadow-2xs group hover:shadow-xs transition-shadow bg-slate-50"
                >
                  <img
                    src={c.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80'}
                    alt={c.name}
                    className="w-full h-24 object-cover"
                  />
                  <div className="p-2.5 flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-xs text-slate-900">{c.name}</h5>
                      <p className="text-[10px] text-slate-500">{c.country}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSavedCity(c.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-6 border-t border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600">
              Danger Zone
            </h4>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200">
              <div>
                <p className="text-xs font-bold text-rose-900">Delete Account & Data</p>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  Permanently delete your account and all associated multi-city trips and itineraries.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition-colors shrink-0"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
