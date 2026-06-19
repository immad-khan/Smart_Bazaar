import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import LandingPage from './pages/LandingPage';
import SellerHub from './pages/SellerHub';
import ProfilePage from './pages/ProfilePage';
import SearchHistoryPage from './pages/SearchHistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import StoreMapPage from './pages/StoreMapPage';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load user from localStorage on mount
    const userData = localStorage.getItem('seller');
    if (userData) {
      const seller = JSON.parse(userData);
      setUser({
        name: seller.fullName || seller.FullName || seller.name || 'Admin',
        email: seller.email || seller.Email || '',
        phone: seller.phoneNumber || seller.PhoneNumber || '',
        address: seller.address || seller.Address || '',
        role: seller.role || seller.Role || '',
        avatar: '',
        ...seller
      });
    }

    // Listen for user changes
    const handleStorageChange = () => {
      const userData = localStorage.getItem('seller');
      if (userData) {
        const seller = JSON.parse(userData);
        setUser({
          name: seller.fullName || seller.FullName || seller.name || 'Admin',
          email: seller.email || seller.Email || '',
          phone: seller.phoneNumber || seller.PhoneNumber || '',
          address: seller.address || seller.Address || '',
          role: seller.role || seller.Role || '',
          avatar: '',
          ...seller
        });
      } else {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const navigateToSeller = () => {
    setCurrentView('seller');
  };

  const navigateToLanding = () => {
    setCurrentView('landing');
  };

  const handleSearch = (query) => {
    // Save search to history
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    searchHistory.unshift({
      query,
      timestamp: new Date().toISOString(),
      resultsCount: 0
    });
    // Keep only last 50 searches
    if (searchHistory.length > 50) {
      searchHistory.pop();
    }
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    
    // Navigate to landing page for search
    setCurrentView('landing');
  };

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage navigateToSeller={navigateToSeller} />;
      case 'seller':
        return <SellerHub navigateToLanding={navigateToLanding} />;
      case 'profile':
        return <ProfilePage user={user} setUser={setUser} />;
      case 'history':
        return <SearchHistoryPage onSearch={handleSearch} />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'store-map':
        return <StoreMapPage />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <LandingPage navigateToSeller={navigateToSeller} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView !== 'seller' && (
        <NavBar currentView={currentView} setCurrentView={setCurrentView} user={user} />
      )}
      {renderView()}
    </div>
  );
}