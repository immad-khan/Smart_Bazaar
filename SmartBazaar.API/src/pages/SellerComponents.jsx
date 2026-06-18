import React, { useState, useEffect, useRef } from 'react';

// API Service for backend communication
const ApiService = {
  API_BASE_URL: 'http://localhost:5009',
  
  async registerSeller(sellerData) {
    const response = await fetch(`${this.API_BASE_URL}/api/sellers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sellerData)
    });
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }
    if (!response.ok) {
      console.error('Registration failed:', response.status, JSON.stringify(data, null, 2));
    }
    return data;
  },

  async loginSeller(credentials) {
    // Use new auth endpoint
    const response = await fetch(`${this.API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
    
    const data = await response.json();
    
    // Store token and user data
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('seller', JSON.stringify(data.user));
    }
    
    return {
      sellerId: data.user.id,
      message: data.message,
      user: data.user
    };
  },

  async createStore(storeData) {
    const response = await fetch(`${this.API_BASE_URL}/api/stores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storeData)
    });
    
    const text = await response.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return text;
    }
  },

  async getStoreBySellerId(sellerId) {
    const response = await fetch(`${this.API_BASE_URL}/api/stores?sellerId=${sellerId}`, {
      method: 'GET'
    });
    return response.json();
  },

  async addProduct(productData) {
    const response = await fetch(`${this.API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    return response.json();
  },

  async getProductsByStoreId(storeId) {
    const response = await fetch(`${this.API_BASE_URL}/api/products?storeId=${storeId}`, {
      method: 'GET'
    });
    return response.json();
  },

  async updateProduct(productData) {
    const response = await fetch(`${this.API_BASE_URL}/api/products`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    return response.json();
  },

  async deleteProduct(productId) {
    const response = await fetch(`${this.API_BASE_URL}/api/products/${productId}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};

// Floating Particles Component
const FloatingParticles = () => {
  const particles = [];
  for (let i = 0; i < 20; i++) {
    particles.push({
      id: i,
      size: Math.random() * 4 + 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 15,
      animationDuration: Math.random() * 10 + 10
    });
  }

  return (
    <div className="floating-particles">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="particle"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDelay: `${particle.animationDelay}s`,
            animationDuration: `${particle.animationDuration}s`
          }}
        />
      ))}
    </div>
  );
};

// Navigation Component
const Navigation = ({ currentPage, setCurrentPage, user }) => {
  return (
    <nav className="bg-black bg-opacity-30 backdrop-blur-md border-b border-purple-500 border-opacity-30 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-white text-2xl font-bold flex items-center cursor-pointer hover:text-purple-400 transition-colors duration-300" onClick={() => window.location.href = '/'}>
                <svg className="w-6 h-6 mr-2 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                SMART BAZAAR
              </h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {!user ? (
                  <>
                    <button 
                      onClick={() => setCurrentPage('login')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${currentPage === 'login' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-purple-700 hover:text-white'}`}
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => setCurrentPage('signup')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${currentPage === 'signup' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-purple-700 hover:text-white'}`}
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setCurrentPage('store')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${currentPage === 'store' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-purple-700 hover:text-white'}`}
                    >
                      Register Store
                    </button>
                    <button 
                      onClick={() => setCurrentPage('products')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${currentPage === 'products' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-purple-700 hover:text-white'}`}
                    >
                      Products
                    </button>
                    <button 
                      onClick={() => {
                        localStorage.removeItem('user');
                        window.location.reload();
                      }}
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-purple-700 hover:text-white"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export { ApiService, FloatingParticles, Navigation };
