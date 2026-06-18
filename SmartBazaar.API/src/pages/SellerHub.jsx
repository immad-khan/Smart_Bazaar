import React, { useState, useEffect } from 'react';
import { Navigation, ApiService } from './SellerComponents';
import NewAuthFlow from './NewAuthFlow';
import { StoreRegistrationPage } from './StorePages';
import { AddProductPage, EditProductPage, ProductsPage } from './ProductPages';

// Session Timeout Component
const SessionTimeout = ({ setCurrentPage, setUser }) => {
  const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  const CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

  useEffect(() => {
    let lastActivityTime = new Date().getTime();
    
    const resetTimer = () => {
      lastActivityTime = new Date().getTime();
    };

    const checkInactivity = () => {
      const currentTime = new Date().getTime();
      if (currentTime - lastActivityTime > INACTIVITY_TIMEOUT) {
        localStorage.removeItem('user');
        setUser(null);
        setCurrentPage('login');
        alert('Session timed out due to inactivity. Please log in again.');
      }
    };

    document.addEventListener('click', resetTimer);
    document.addEventListener('mousemove', resetTimer);
    document.addEventListener('keydown', resetTimer);

    const inactivityTimer = setInterval(checkInactivity, CHECK_INTERVAL);

    return () => {
      clearInterval(inactivityTimer);
      document.removeEventListener('click', resetTimer);
      document.removeEventListener('mousemove', resetTimer);
      document.removeEventListener('keydown', resetTimer);
    };
  }, [setCurrentPage, setUser]);

  return null;
};

// Main SellerHub Component
export default function SellerHub({ navigateToLanding }) {
  const [currentPage, setCurrentPage] = useState('auth');
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loadingStore, setLoadingStore] = useState(false);

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // We will check for store in the user effect
    }
  }, []);

  // Effect to fetch store when user is set
  useEffect(() => {
    const fetchStore = async () => {
      if (user) {
        setLoadingStore(true);
        try {
          const sellerId = user.id || user.Id || user.sellerID;
          console.log('Fetching store for seller:', sellerId);
          const storeData = await ApiService.getStoreBySellerId(sellerId);
          console.log('Fetched store data:', storeData);
          if (storeData && (storeData.storeID || storeData.StoreID)) {
            setStore(storeData);
            if (currentPage === 'auth') {
              setCurrentPage('products');
            }
          } else {
            setCurrentPage('store');
          }
        } catch (error) {
          console.error("Failed to fetch store:", error);
          setCurrentPage('store');
        } finally {
          setLoadingStore(false);
        }
      }
    };
    fetchStore();
  }, [user]);

  // Handle successful authentication from NewAuthFlow
  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    // Page will be set in fetchStore effect
  };

  // Helper to set page with optional product data
  const handleSetCurrentPage = (page, productData) => {
    setCurrentPage(page);
    if (productData) {
      setEditingProduct(productData);
    }
  };

  const renderPage = () => {
    if (loadingStore) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      );
    }

    switch(currentPage) {
      case 'auth':
        return <NewAuthFlow onAuthSuccess={handleAuthSuccess} />;
      case 'store':
        return <StoreRegistrationPage setCurrentPage={handleSetCurrentPage} user={user} setStore={setStore} />;
      case 'addProduct':
        return <AddProductPage setCurrentPage={handleSetCurrentPage} user={user} store={store} />;
      case 'editProduct':
        return <EditProductPage setCurrentPage={handleSetCurrentPage} user={user} product={editingProduct} store={store} />;
      case 'products':
        return <ProductsPage setCurrentPage={handleSetCurrentPage} user={user} store={store} />;
      default:
        return <NewAuthFlow onAuthSuccess={handleAuthSuccess} />;
    }
  };

  return (
    <div className="bg-gradient min-h-screen">
      <Navigation currentPage={currentPage} setCurrentPage={handleSetCurrentPage} user={user} />
      <SessionTimeout setCurrentPage={handleSetCurrentPage} setUser={setUser} />
      {renderPage()}
    </div>
  );
}
