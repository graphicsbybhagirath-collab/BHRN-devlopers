import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart, Globe2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-slate-900">GlobeTrotter</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              The premier platform for multi-city travel planning, day-by-day itineraries, dynamic budget estimation, and trip sharing.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Explore</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link to="/cities" className="hover:text-brand-600 transition-colors">Top Destinations</Link></li>
              <li><Link to="/activities" className="hover:text-brand-600 transition-colors">Curated Activities</Link></li>
              <li><Link to="/trips/new" className="hover:text-brand-600 transition-colors">Create Multi-City Trip</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Planning Tools</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><span className="text-slate-500">Day-by-Day Builder</span></li>
              <li><span className="text-slate-500">Real-Time Cost Calculator</span></li>
              <li><span className="text-slate-500">Timeline & Calendar Sync</span></li>
              <li><span className="text-slate-500">1-Click Public Trip Clone</span></li>
            </ul>
          </div>

          {/* Demo Details */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-brand-600" />
              Demo Account
            </h4>
            <p className="text-[11px] text-slate-500 font-mono mt-1">demo@globetrotter.com</p>
            <p className="text-[11px] text-slate-500 font-mono">Password: Demo@123</p>
            <p className="text-[10px] text-brand-700 font-medium mt-2">Ready with pre-seeded Europe Grand Tour</p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} GlobeTrotter Travel Planner. Hackathon Edition.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for global adventurers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
