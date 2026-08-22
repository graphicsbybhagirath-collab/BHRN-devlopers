import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Users,
  MapPin,
  Compass,
  Calendar,
  Sparkles,
  TrendingUp,
  Activity as ActivityIcon,
  ShieldAlert,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { adminService } from '../services/api';
import { AnalyticsData } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0284c7', '#0d9488', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981'];

export const AdminAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAnalytics();
      setData(res);
    } catch (err) {
      console.error('Failed to load admin analytics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading Platform Analytics..." />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Travelers',
      value: data.overview.total_users,
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      change: '+18% this month'
    },
    {
      title: 'Trips Planned',
      value: data.overview.total_trips,
      icon: Compass,
      color: 'from-brand-500 to-ocean-600',
      change: '+24% this week'
    },
    {
      title: 'Destination Cities',
      value: data.overview.total_cities,
      icon: MapPin,
      color: 'from-teal-500 to-emerald-600',
      change: '15 global hubs'
    },
    {
      title: 'Curated Experiences',
      value: data.overview.total_activities,
      icon: Sparkles,
      color: 'from-amber-500 to-orange-600',
      change: '60+ rich sights'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-400/30 mb-3">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Platform Administration & Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              GlobeTrotter Growth & Usage Insights
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-1 max-w-2xl">
              Real-time platform metrics, user adoption trends, top visited global cities, and traveler activity preferences.
            </p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="self-start md:self-auto px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-sm font-semibold transition-all"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Overview Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.title}</p>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${stat.color} text-white flex items-center justify-center shadow-xs`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {stat.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Cities Visited */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600" />
                Most Popular Destination Cities
              </h2>
              <p className="text-xs text-slate-500">Based on itinerary stop frequency</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.top_cities}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="visit_count" name="Trip Stops" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Activity Categories */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Activity Category Distribution
              </h2>
              <p className="text-xs text-slate-500">Scheduled activities breakdown</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.popular_categories}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.popular_categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Trips & Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Trips Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-brand-600" />
              Recent Itineraries Created
            </h2>
            <span className="text-xs font-semibold text-slate-500">Latest 5 Trips</span>
          </div>
          <div className="divide-y divide-slate-100">
            {data.recent_trips.map((trip) => (
              <div key={trip.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{trip.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    By <span className="font-semibold text-slate-700">{trip.user_name}</span> • {trip.stops_count} stops
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                    {trip.start_date || 'Flexible Dates'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Registered Users */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Registered Travelers
            </h2>
            <span className="text-xs font-semibold text-slate-500">Active Accounts</span>
          </div>
          <div className="divide-y divide-slate-100">
            {data.recent_users.map((u) => (
              <div key={u.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{u.name}</h3>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 border border-brand-200/50">
                  {u.trip_count} {u.trip_count === 1 ? 'Trip' : 'Trips'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
