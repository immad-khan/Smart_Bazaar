import React, { useState, useEffect, useRef } from 'react';
import { recognizeImage, searchProducts } from '../services/api';
import SearchBar from '../components/SearchBar';
import PriceSummary from '../components/PriceSummary';

export default function LandingPage({ navigateToSeller }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [sortOrder, setSortOrder] = useState('lowest');
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const fileInputRef = useRef(null);

  const handleSearch = async (query) => {
    if (!query.trim()) return;

    setSearchQuery(query);
    setLoading(true);
    setShowResults(true);
    
    try {
      const data = await searchProducts(query);
      setSearchResults(data);
      
      // Save search to history
      const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const totalResults = (data.database?.length || 0) + (data.scraped?.length || 0);
      const newEntry = {
        query,
        timestamp: new Date().toISOString(),
        resultsCount: totalResults
      };
      searchHistory.unshift(newEntry);
      
      // Keep only last 50 searches
      if (searchHistory.length > 50) {
        searchHistory.pop();
      }
      
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
      console.log('Search saved to history:', newEntry);
      console.log('Total searches in history:', searchHistory.length);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults({ error: 'Search failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const getSortedResults = () => {
    if (!searchResults) return null;

    const sorted = { ...searchResults };
    const dbProducts = (sorted.database || []).map(p => {
      const priceStr = String(p.price || p.Price || '0').replace(/[^0-9.]/g, '');
      return { ...p, priceNum: parseFloat(priceStr) || 0 };
    });
    
    const scrapedProducts = (sorted.scraped || []).map(p => {
      // Handle various price formats for scraped products
      const priceStr = String(p.price || '0')
        .replace(/Rs\.?/gi, '')
        .replace(/PKR/gi, '')
        .replace(/,/g, '')
        .replace(/[^0-9.]/g, '');
      return { ...p, priceNum: parseFloat(priceStr) || 0 };
    });

    const allProducts = [...dbProducts, ...scrapedProducts];

    if (sortOrder === 'lowest') {
      allProducts.sort((a, b) => a.priceNum - b.priceNum);
    } else {
      allProducts.sort((a, b) => b.priceNum - a.priceNum);
    }

    // Separate back into database and scraped
    const dbCount = dbProducts.length;
    sorted.database = allProducts.slice(0, dbCount).map(({ priceNum, ...p }) => p);
    sorted.scraped = allProducts.slice(dbCount).map(({ priceNum, ...p }) => p);

    return sorted;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsRecognizing(true);
      const result = await recognizeImage(file);
      
      if (result && result.error) {
        alert(result.message || 'Image search is currently unavailable. Please use text search instead.');
        return;
      }
      
      if (result && result.length > 0) {
        const topPrediction = result[0];
        const recognizedText = topPrediction.label;
        
        setSearchQuery(recognizedText);
        
        setTimeout(() => {
          handleSearch(recognizedText);
        }, 100);
      } else {
        alert('No products found similar to this image. Try searching by text instead.');
      }
    } catch (error) {
      console.error('Image recognition error:', error);
      alert('Image search failed. Please try text search instead.');
    } finally {
      setIsRecognizing(false);
      e.target.value = '';
    }
  };

  const loadUserProfile = async () => {
    const userData = localStorage.getItem('seller');
    if (userData) {
      const seller = JSON.parse(userData);
      setUser(seller);
      
      // Fetch store details
      try {
        const response = await fetch(`/api/stores?sellerId=${seller.SellerId}`);
        const stores = await response.json();
        if (stores && stores.length > 0) {
          setStore(stores[0]);
        }
      } catch (error) {
        console.error('Failed to load store:', error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('seller');
    setUser(null);
    setStore(null);
    setShowProfileMenu(false);
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.ProductId === product.ProductId);
    let updatedCart;
    
    if (existingItem) {
      updatedCart = cart.map(item =>
        item.ProductId === product.ProductId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }
    
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(item => item.ProductId !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    const updatedCart = cart.map(item =>
      item.ProductId === productId ? { ...item, quantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + ((item.Price || 0) * (item.quantity || 1)), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  useEffect(() => {
    loadUserProfile();
    loadCart();
  }, []);

  useEffect(() => {
    const cards = document.querySelectorAll('.card');
    
    function rotate() {
      cards.forEach(card => {
        const pos = card.dataset.pos;
        card.classList.remove('pos-left', 'pos-center', 'pos-right');

        if (pos === 'left') {
          card.dataset.pos = 'center';
          card.classList.add('pos-center');
        } else if (pos === 'center') {
          card.dataset.pos = 'right';
          card.classList.add('pos-right');
        } else {
          card.dataset.pos = 'left';
          card.classList.add('pos-left');
        }
      });
    }

    const interval = setInterval(rotate, 5200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient text-white overflow-x-hidden min-h-screen">
      {/* Cart Icon - Fixed Position */}
      <button
        onClick={() => setShowCart(!showCart)}
        className="fixed top-20 right-6 z-40 px-4 py-2 rounded-full bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 hover:bg-opacity-20 transition"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {getTotalItems() > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {getTotalItems()}
          </span>
        )}
      </button>

      {/* Register Your Mart Button - Fixed Position */}
      {!user && (
        <button
          onClick={navigateToSeller}
          className="fixed top-20 right-24 z-40 px-10 py-2 rounded-full bg-black text-white text-base font-medium hover:bg-neutral-800 transition"
        >
          Register Your Mart
        </button>
      )}

      <section className="min-h-screen flex flex-col items-center justify-center pt-24">
        <div id="search-section" className="text-center max-w-3xl mb-12">
          <h1 className="text-5xl font-semibold">Transform Your Shopping Journey</h1>
          <p className="mt-4 text-gray-300">
            Compare prices across Pakistan with elegance, speed, and confidence.
          </p>
          
          {/* Search Bar with Camera and Search Button */}
          <SearchBar 
            onSearch={handleSearch} 
            onCameraClick={handleCameraClick}
            loading={loading}
            isRecognizing={isRecognizing}
          />

          <input 
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/gif, image/webp, image/bmp"
            capture="environment"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </div>

        {/* Search Results */}
        {showResults && searchResults && (
          <div className="w-full max-w-7xl mx-auto px-4 mb-12">
            <div className="flex gap-6">
              {/* Main Results */}
              <div className="flex-1">
                <div className="bg-black bg-opacity-40 backdrop-blur-lg rounded-2xl p-6">
                  {searchResults.error ? (
                    <p className="text-center text-red-400">{searchResults.error}</p>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Search Results for "{searchResults.query}"</h2>
                        <button
                          onClick={() => setShowResults(false)}
                          className="text-gray-400 hover:text-white"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-gray-300 mb-4">Found {searchResults.totalResults} results</p>

                      {(() => {
                        const sorted = getSortedResults();
                        return (
                          <>
                            {/* Database Products */}
                            {sorted.database && sorted.database.length > 0 && (
                              <div className="mb-8">
                                <h3 className="text-xl font-semibold mb-4 text-purple-400">Local Stores</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {sorted.database.map((product, index) => (
                                    <div key={index} className="bg-gray-800 bg-opacity-50 rounded-lg p-4 hover:bg-opacity-70 transition-all">
                                      {product.image && (
                                        <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-lg mb-3" />
                                      )}
                                      <h4 className="font-semibold text-white mb-2">{product.name}</h4>
                                      <p className="text-sm text-gray-400 mb-2 line-clamp-2">{product.description}</p>
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-2xl font-bold text-purple-400">PKR {product.price}</span>
                                        <span className="text-sm text-gray-400">{product.store}</span>
                                      </div>
                                      {product.stock > 0 && (
                                        <p className="text-xs text-green-400 mb-2">In Stock: {product.stock}</p>
                                      )}
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          const price = parseFloat(product.price || product.Price || 0);
                                          const cartItem = {
                                            ProductId: product.productid || product.ProductId || `temp-${Date.now()}`,
                                            ProductName: product.name || product.ProductName || 'Unknown Product',
                                            Price: isNaN(price) ? 0 : price,
                                            ImageUrl: product.image || product.ImageUrl || '',
                                            StoreName: product.store || product.StoreName || 'Unknown Store',
                                            StockQuantity: product.stock || product.StockQuantity || 0,
                                            Contact: product.contact,
                                            Address: product.address,
                                            GoogleMapsUrl: product.googlemapsurl,
                                            Latitude: product.latitude,
                                            Longitude: product.longitude
                                          };
                                          addToCart(cartItem);
                                        }}
                                        className="w-full px-4 py-2 text-white text-sm font-semibold rounded-lg transition-all mb-2 border border-purple-500 border-opacity-40"
                                        style={{ backgroundColor: '#0C0715' }}
                                      >
                                        🛒 Add to Cart
                                      </button>
                                      <div className="flex gap-2 mt-1">
                                        {product.contact && (
                                          <a
                                            href={`https://wa.me/${product.contact.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg flex items-center justify-center gap-2 transition-colors"
                                          >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                            </svg>
                                            WhatsApp
                                          </a>
                                        )}
                                        <a
                                          href={
                                            product.googlemapsurl || 
                                            (product.latitude && product.longitude 
                                              ? `https://www.google.com/maps?q=${product.latitude},${product.longitude}`
                                              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(product.address || product.store)}`)
                                          }
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center justify-center gap-2 transition-colors"
                                        >
                                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                          </svg>
                                          Maps
                                        </a>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Scraped Products */}
                            {sorted.scraped && sorted.scraped.length > 0 && (
                              <div>
                                <h3 className="text-xl font-semibold mb-4 text-pink-400">Online Stores</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {sorted.scraped.map((product, index) => (
                                    <a
                                      key={index}
                                      href={product.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="bg-gray-800 bg-opacity-50 rounded-lg p-4 hover:bg-opacity-70 transition-all block"
                                    >
                                      {product.image && (
                                        <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-lg mb-3" />
                                      )}
                                      <h4 className="font-semibold text-white mb-2">{product.name}</h4>
                                      <div className="flex justify-between items-center">
                                        <span className="text-2xl font-bold text-pink-400">{product.price}</span>
                                        <span className="text-sm text-gray-400">{product.source}</span>
                                      </div>
                                      <p className="text-xs text-blue-400 mt-2 flex items-center">
                                        View on {product.source}
                                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                      </p>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {searchResults.totalResults === 0 && (
                              <p className="text-center text-gray-400 py-8">No products found. Try a different search term.</p>
                            )}
                          </>
                        );
                      })()}
                    </>
                  )}
                </div>
              </div>

              {/* Price Summary Sidebar */}
              {searchResults && !searchResults.error && (
                <div className="w-80">
                  <PriceSummary 
                    searchResults={searchResults}
                    onSortChange={setSortOrder}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {!showResults && (
          <div className="relative w-[1100px] h-[420px]">
          {/* BEST PRICES */}
          <div className="card pos-left" data-pos="left">
            <div className="h-full flex flex-col items-center justify-between p-6">
              <svg width="220" height="150" fill="none">
                <g className="loser-fade">
                  <rect x="30" y="45" width="70" height="60" rx="12" stroke="white" strokeWidth="2" />
                  <text x="65" y="80" fill="white" fontSize="18" fontWeight="500" textAnchor="middle">
                    ₨520
                  </text>
                </g>

                <g>
                  <rect x="120" y="30" width="80" height="80" rx="14" stroke="white" strokeWidth="2" />
                  <text x="160" y="80" fill="white" fontSize="22" fontWeight="700" textAnchor="middle">
                    ₨450
                  </text>

                  <rect x="120" y="30" width="80" height="80" rx="14" stroke="white" strokeWidth="3" className="winner-pulse" />
                </g>
              </svg>

              <div className="text-center">
                <h3 className="text-base font-medium">Best Prices</h3>
                <p className="text-sm text-gray-300 mt-1">Lowest prices across marts.</p>
              </div>
            </div>
          </div>

          {/* TRUSTED MARTS */}
          <div className="card pos-center" data-pos="center">
            <div className="h-full flex flex-col items-center justify-between p-6">
              <svg width="200" height="200" fill="none">
                <rect x="40" y="60" width="120" height="80" rx="14" stroke="white" strokeWidth="2" />

                <path
                  d="M80 100L95 115L130 80"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="stamp-press"
                />
              </svg>

              <div className="text-center">
                <h3 className="text-base font-medium">Trusted Marts</h3>
                <p className="text-sm text-gray-300 mt-1">Verified retailers only.</p>
              </div>
            </div>
          </div>

          {/* INSTANT COMPARE */}
          <div className="card pos-right" data-pos="right">
            <div className="h-full flex flex-col items-center justify-between p-6">
              <svg width="180" height="200" fill="none">
                <rect x="30" y="40" width="120" height="120" rx="16" stroke="white" strokeWidth="2" />

                <circle cx="90" cy="95" r="28" stroke="white" strokeWidth="4" />

                <line x1="110" y1="115" x2="135" y2="140" stroke="white" strokeWidth="4" />

                <rect x="45" y="75" width="40" height="8" rx="4" fill="white" />
                <rect x="95" y="65" width="40" height="8" rx="4" fill="white" />

                <line x1="30" y1="95" x2="150" y2="95" stroke="white" strokeWidth="2" className="scan-sweep" />
              </svg>

              <div className="text-center">
                <h3 className="text-base font-medium">Instant Compare</h3>
                <p className="text-sm text-gray-300 mt-1">One search. Instant results.</p>
              </div>
            </div>
          </div>
        </div>
        )}
      </section>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex items-start justify-end pt-20 pr-4">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setShowCart(false)}
          ></div>
          <div className="relative rounded-lg shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col" style={{ backgroundColor: '#0C0715' }}>
            {/* Cart Header */}
            <div className="p-4 text-white flex justify-between items-center border-b border-purple-500 border-opacity-30">
              <h2 className="text-xl font-bold">🛒 Shopping Cart</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-white hover:bg-white hover:bg-opacity-10 rounded-full p-2 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-lg font-semibold">Your cart is empty</p>
                  <p className="text-sm mt-2">Add products to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.ProductId} className="flex gap-3 bg-white bg-opacity-5 rounded-lg p-3 border border-purple-500 border-opacity-20">
                      <img
                        src={item.ImageUrl || 'https://via.placeholder.com/80'}
                        alt={item.ProductName}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-sm">{item.ProductName}</h3>
                        <p className="text-xs text-gray-400 mt-1">{item.StoreName}</p>
                        <p className="text-purple-400 font-bold mt-1">PKR {(item.Price || 0).toFixed(2)}</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.ProductId, item.quantity - 1)}
                            className="w-6 h-6 bg-white bg-opacity-10 hover:bg-opacity-20 rounded flex items-center justify-center text-white font-bold"
                          >
                            -
                          </button>
                          <span className="text-sm font-semibold px-2 text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.ProductId, item.quantity + 1)}
                            className="w-6 h-6 bg-white bg-opacity-10 hover:bg-opacity-20 rounded flex items-center justify-center text-white font-bold"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.ProductId)}
                            className="ml-auto text-red-400 hover:text-red-300 text-xs font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                        
                        {/* WhatsApp and Maps buttons */}
                        <div className="flex gap-1 mt-2">
                          {item.Contact && (
                            <a
                              href={`https://wa.me/${item.Contact.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded flex items-center justify-center gap-1 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                              </svg>
                              Chat
                            </a>
                          )}
                          <a
                            href={
                              item.GoogleMapsUrl || 
                              (item.Latitude && item.Longitude 
                                ? `https://www.google.com/maps?q=${item.Latitude},${item.Longitude}`
                                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.Address || item.StoreName)}`)
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded flex items-center justify-center gap-1 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                            Maps
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-purple-500 border-opacity-30">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-400">Total ({getTotalItems()} items)</span>
                  <span className="text-2xl font-bold text-purple-400">PKR {getTotalPrice().toFixed(2)}</span>
                </div>
                <button
                  onClick={clearCart}
                  className="w-full px-4 py-2 bg-red-600 bg-opacity-20 hover:bg-opacity-30 text-red-400 font-semibold rounded-lg transition border border-red-500 border-opacity-30"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
