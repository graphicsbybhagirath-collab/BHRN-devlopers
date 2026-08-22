import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { BudgetSummary } from '../../types';
import { format, parseISO } from 'date-fns';

interface BudgetChartsProps {
  budget: BudgetSummary;
}

const CATEGORY_COLORS: Record<string, string> = {
  Transport: '#0284c7', // Sky blue
  Accommodation: '#8b5cf6', // Purple
  Activities: '#0d9488', // Teal
  Meals: '#f59e0b', // Amber
  Miscellaneous: '#64748b', // Slate
};

export const BudgetCharts: React.FC<BudgetChartsProps> = ({ budget }) => {
  const pieData = budget.category_breakdown
    .filter((c) => c.amount > 0)
    .map((c) => ({
      name: c.category,
      value: c.amount,
      percentage: c.percentage,
    }));

  const barData = budget.daily_breakdown.map((d, index) => {
    let label = `Day ${index + 1}`;
    try {
      label = format(parseISO(d.date), 'd MMM');
    } catch {
      label = d.date;
    }
    return {
      date: label,
      fullDate: d.date,
      amount: d.amount,
      cityName: d.city_name,
      activityCount: d.activity_count,
    };
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Find most expensive day
  const maxDay = [...budget.daily_breakdown].sort((a, b) => b.amount - a.amount)[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Category Breakdown (Pie Chart) */}
      <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Expenses by Category</h3>
          <p className="text-xs text-slate-500 mb-4">Distribution of estimated and logged trip spend</p>
        </div>

        <div className="h-64 w-full">
          {pieData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No expenses recorded yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={CATEGORY_COLORS[entry.name] || '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Estimated']}
                  contentStyle={{
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category List Breakdown */}
        <div className="space-y-2 pt-3 border-t border-slate-100">
          {budget.category_breakdown.map((cat) => (
            <div key={cat.category} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[cat.category] || '#94a3b8' }}
                />
                <span className="font-semibold text-slate-700">{cat.category}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900">{formatCurrency(cat.amount)}</span>
                <span className="text-slate-400 font-mono w-10 text-right">{cat.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Cost Breakdown (Bar Chart) */}
      <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Daily Spend & Activity Intensity</h3>
              <p className="text-xs text-slate-500">Day-by-day cost progression across your stops</p>
            </div>
            {maxDay && maxDay.amount > 0 && (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                Peak Day: {formatCurrency(maxDay.amount)}
              </span>
            )}
          </div>
        </div>

        <div className="h-72 w-full mt-4">
          {barData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No itinerary days to display.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Day Spend']}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                      const item = payload[0].payload;
                      return `${item.fullDate} (${item.cityName || 'In Transit'}) - ${item.activityCount} activities`;
                    }
                    return label;
                  }}
                  contentStyle={{
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="amount" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Total Days: {budget.total_days}</span>
          <span>Includes scheduled sights, tours, and custom expenses</span>
        </div>
      </div>
    </div>
  );
};
