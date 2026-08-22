import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyTripsPage } from './pages/MyTripsPage';
import { CreateTripPage } from './pages/CreateTripPage';
import { ItineraryBuilderPage } from './pages/ItineraryBuilderPage';
import { ItineraryViewPage } from './pages/ItineraryViewPage';
import { CitySearchPage } from './pages/CitySearchPage';
import { ActivitySearchPage } from './pages/ActivitySearchPage';
import { BudgetPage } from './pages/BudgetPage';
import { CalendarPage } from './pages/CalendarPage';
import { SharedTripPage } from './pages/SharedTripPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" label="Checking session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Landing */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth Pages */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <SignupPage />
              </PublicOnlyRoute>
            }
          />

          {/* Shared Public Itinerary (Accessible unauthenticated or authenticated) */}
          <Route path="/shared/:shareToken" element={<SharedTripPage />} />
          <Route path="/shared/:token" element={<SharedTripPage />} />

          {/* Discovery Pages (Accessible to all) */}
          <Route path="/cities" element={<CitySearchPage />} />
          <Route path="/activities" element={<ActivitySearchPage />} />

          {/* Protected Dashboard & Trip Management */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips"
            element={
              <ProtectedRoute>
                <MyTripsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips/create"
            element={
              <ProtectedRoute>
                <CreateTripPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips/new"
            element={
              <ProtectedRoute>
                <CreateTripPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips/:id"
            element={
              <ProtectedRoute>
                <ItineraryViewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips/:id/builder"
            element={
              <ProtectedRoute>
                <ItineraryBuilderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips/:id/view"
            element={
              <ProtectedRoute>
                <ItineraryViewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips/:id/budget"
            element={
              <ProtectedRoute>
                <BudgetPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips/:id/calendar"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<AdminAnalyticsPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
