export interface User {
  id: number;
  name: string;
  email: string;
  profile_image?: string;
  language?: string;
  created_at: string;
}

export interface City {
  id: number;
  name: string;
  country: string;
  region?: string;
  description?: string;
  image?: string;
  cost_index: number; // 1 to 5
  popularity: number; // 1 to 100
  activity_count?: number;
}

export interface Activity {
  id: number;
  city_id: number;
  city_name?: string;
  name: string;
  category: 'Sightseeing' | 'Food' | 'Adventure' | 'Culture' | 'Shopping' | 'Nature' | 'Entertainment' | string;
  description?: string;
  image?: string;
  duration_minutes: number;
  estimated_cost: number;
  rating: number;
}

export interface ItineraryActivity {
  id: number;
  trip_stop_id: number;
  activity_id: number;
  activity_date: string; // YYYY-MM-DD
  start_time?: string; // "10:00"
  order_index: number;
  notes?: string;
  activity: Activity;
}

export interface TripStop {
  id: number;
  trip_id: number;
  city_id: number;
  start_date: string;
  end_date: string;
  order_index: number;
  city: City;
  itinerary_activities: ItineraryActivity[];
}

export interface Expense {
  id: number;
  trip_id: number;
  category: 'Transport' | 'Accommodation' | 'Activities' | 'Meals' | 'Miscellaneous' | string;
  amount: number;
  expense_date?: string;
  description?: string;
}

export interface Trip {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  cover_image?: string;
  created_at: string;
  updated_at: string;
  stop_count?: number;
  estimated_cost?: number;
  cities_summary?: string;
  stops?: TripStop[];
  expenses?: Expense[];
  share_token?: string;
}

export interface CategoryCost {
  category: string;
  amount: number;
  percentage: number;
}

export interface DailyCost {
  date: string;
  amount: number;
  city_name?: string;
  activity_count: number;
}

export interface BudgetSummary {
  total_estimated_cost: number;
  average_per_day: number;
  total_days: number;
  categories: Record<string, number>;
  category_breakdown: CategoryCost[];
  daily_breakdown: DailyCost[];
  expenses: Expense[];
  target_budget?: number;
  is_over_budget: boolean;
  budget_difference: number;
  budget_status: 'within_budget' | 'over_budget';
}

export interface PublicTripView {
  trip: Trip;
  budget: BudgetSummary;
  owner_name: string;
}

export interface SharedTripResponse {
  id: number;
  trip_id: number;
  share_token: string;
  is_public: boolean;
  created_at: string;
  share_url?: string;
}

export interface AnalyticsData {
  overview: {
    total_users: number;
    total_trips: number;
    total_cities: number;
    total_activities: number;
    total_stops: number;
    total_scheduled_activities: number;
  };
  top_cities: {
    name: string;
    country: string;
    image: string;
    visit_count: number;
  }[];
  popular_categories: {
    category: string;
    count: number;
  }[];
  recent_trips: {
    id: number;
    name: string;
    user_name: string;
    start_date: string;
    end_date: string;
    stops_count: number;
    created_at: string;
  }[];
  recent_users: {
    id: number;
    name: string;
    email: string;
    trip_count: number;
    created_at: string;
  }[];
}
