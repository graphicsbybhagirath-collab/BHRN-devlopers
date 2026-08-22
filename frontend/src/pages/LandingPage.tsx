import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Calendar,
  DollarSign,
  Share2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Globe2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const featuredDestinations = [
    {
      name: 'Paris',
      country: 'France',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
      tag: 'Culture & Gastronomy',
    },
    {
      name: 'Tokyo',
      country: 'Japan',
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
      tag: 'Neon & Heritage',
    },
    {
      name: 'Rome',
      country: 'Italy',
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
      tag: 'Ancient Marvels',
    },
    {
      name: 'Bali',
      country: 'Indonesia',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
      tag: 'Tropical Escapes',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold shadow-2xs">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Next-Gen Multi-City Travel Planning</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Dream. Design.{' '}
              <span className="bg-gradient-to-r from-brand-600 to-ocean-600 bg-clip-text text-transparent">
                Explore the World
              </span>{' '}
              on Your Terms.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Construct multi-city itineraries, curate activities by day and hour, calculate real-time budgets, visualize with timelines, and share with fellow travelers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to={isAuthenticated ? '/dashboard' : '/signup'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
              >
                <span>{isAuthenticated ? 'Go to Dashboard' : 'Start Planning Free'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/cities"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-2xs transition-colors"
              >
                <Globe2 className="w-4 h-4 text-brand-600" />
                <span>Explore 20+ Cities</span>
              </Link>
            </div>

            {/* Demo user badge */}
            <div className="pt-4">
              <span className="text-xs text-slate-500 font-medium">
                Try demo account:{' '}
                <span className="font-mono font-bold text-brand-700">demo@globetrotter.com</span> /{' '}
                <span className="font-mono font-bold text-brand-700">Demo@123</span>
              </span>
            </div>
          </div>
        </div>

        {/* Hero Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-brand-400/15 via-ocean-400/15 to-transparent blur-3xl pointer-events-none -z-10" />
      </section>

      {/* Featured Destinations Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Featured Global Destinations</h2>
            <p className="text-sm text-slate-500 mt-1">Discover curated cities with handpicked activities</p>
          </div>
          <Link
            to="/cities"
            className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDestinations.map((dest) => (
            <div
              key={dest.name}
              className="group relative rounded-2xl overflow-hidden aspect-4/5 shadow-xs hover:shadow-card transition-all"
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="absolute top-3 left-3">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/90 text-slate-900 shadow-2xs">
                  {dest.tag}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl font-extrabold text-white">{dest.name}</h3>
                <p className="text-xs text-slate-200">{dest.country}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Everything You Need for Multi-City Adventures
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            No more messy spreadsheets or disconnected notes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Multi-Stop Route Builder</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Organize multiple cities, adjust arrival and departure dates, and reorder stops seamlessly as your plans evolve.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Dynamic Budget Engine</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Auto-calculate estimated costs for sights, transit, accommodation, and food with over-budget alerts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Public Sharing & 1-Click Copy</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Share beautiful read-only itineraries with a single link, and allow fellow travelers to clone and customize them.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-ocean-600 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold">Ready to plan your dream vacation?</h3>
            <p className="text-sm text-brand-100 max-w-xl">
              Join GlobeTrotter today and build your first personalized multi-city itinerary in minutes.
            </p>
          </div>
          <Link
            to={isAuthenticated ? '/trips/new' : '/signup'}
            className="px-8 py-3.5 rounded-xl bg-white text-brand-900 font-extrabold text-sm shadow-md hover:bg-brand-50 transition-colors shrink-0"
          >
            Plan Your Journey Now
          </Link>
        </div>
      </section>
    </div>
  );
};
