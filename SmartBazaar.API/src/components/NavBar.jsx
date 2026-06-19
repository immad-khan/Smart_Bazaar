import React, { useState } from 'react';
import { FaUser, FaHistory, FaChartBar, FaMapMarkedAlt, FaHome, FaStore, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';

export default function NavBar({ currentView, setCurrentView, user }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('seller');
    localStorage.removeItem('authToken');
    window.location.reload();
  };

  const navItems = [
    { id: "landing", label: "Home", icon: <FaHome /> },
    { id: "history", label: "History", icon: <FaHistory /> },
    { id: "analytics", label: "Analytics", icon: <FaChartBar /> },
    { id: "store-map", label: "Stores", icon: <FaMapMarkedAlt /> },
  ];

  if (user && (user.role === 'Admin' || user.Role === 'Admin')) {
    navItems.push({ id: "admin", label: "Admin", icon: <FaShieldAlt /> });
  }

  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <nav className="bg-[#0B0715]/95 backdrop-blur-xl text-white shadow-2xl sticky top-0 z-50 border-b border-purple-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-950/50 via-black/50 to-purple-950/50 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex-shrink-0 flex items-center cursor-pointer group transition-all duration-300 hover:scale-105"
              onClick={() => setCurrentView("landing")}
            >
              <div className="relative">
                <FaStore className="text-purple-400 text-2xl mr-3 group-hover:text-purple-300 transition-all duration-300 group-hover:rotate-12" />
                <div className="absolute inset-0 blur-xl bg-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <h1 className="text-2xl font-bold tracking-wide bg-gradient-to-r from-purple-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                Smart Bazaar
              </h1>
            </div>

            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`relative flex items-center space-x-2 px-5 py-2.5 rounded-lg transition-all duration-300 text-sm font-medium border group ${
                    currentView === item.id
                      ? "bg-purple-600/20 text-purple-200 border-purple-500/60 shadow-lg shadow-purple-500/20"
                      : "text-gray-400 hover:text-white border-transparent hover:border-purple-500/30 hover:bg-purple-900/10"
                  }`}
                >
                  <span
                    className={`text-base transition-transform duration-300 ${
                      currentView === item.id ? "scale-110" : "group-hover:scale-110"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>

                  {currentView === item.id && (
                    <div className="absolute inset-0 rounded-lg bg-purple-500/10 blur-sm -z-10 animate-pulse" />
                  )}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center">
              {user ? (
                <div className="relative">
                  <div 
                    className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-black/60 backdrop-blur-sm border border-purple-900/50 shadow-lg shadow-black/50 hover:border-purple-800/70 transition-all duration-300 hover:scale-105 cursor-pointer"
                    onClick={() => setShowLogoutMenu(!showLogoutMenu)}
                  >
                    <div className="relative">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 flex items-center justify-center text-white font-semibold shadow-lg ring-2 ring-purple-900/50">
                        {(user.name || user.email)?.charAt(0).toUpperCase() || 'A'}
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-purple-200">{user.name || user.fullName || user.FullName || 'Admin'}</p>
                      <p className="text-xs text-purple-400/80">{user.email}</p>
                    </div>
                    <div className="ml-2 p-2">
                      <FaUser className="text-purple-500" />
                    </div>
                  </div>
                  
                  {showLogoutMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0B0715]/95 backdrop-blur-xl border border-purple-500/30 shadow-2xl shadow-purple-500/20 overflow-hidden z-50">
                      <button
                        onClick={() => {
                          setCurrentView("profile");
                          setShowLogoutMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-white hover:bg-purple-600/20 transition-all duration-300 border-b border-purple-500/20"
                      >
                        <FaUser className="text-purple-400" />
                        <span>View Profile</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-400 hover:bg-red-600/20 transition-all duration-300"
                      >
                        <FaSignOutAlt className="text-red-400" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-black/40 backdrop-blur-sm border border-purple-500/20 shadow-lg">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center ring-2 ring-purple-500/20">
                    <FaUser className="text-gray-500 text-sm" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-400">Guest User</p>
                    <p className="text-xs text-gray-600">Not logged in</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-purple-700/20 transition-all duration-300 border border-transparent hover:border-purple-500/30"
            >
              <svg
                className="h-6 w-6 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ transform: isMenuOpen ? "rotate(90deg)" : "rotate(0deg)" }}
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden pb-4 space-y-2 border-t border-purple-500/20 pt-4 animate-in slide-in-from-top duration-300">
              {user ? (
                <div className="space-y-2 mb-2">
                  <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-black/60 backdrop-blur-sm border border-purple-900/50 shadow-lg">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 flex items-center justify-center text-white font-semibold shadow-lg ring-2 ring-purple-900/50">
                        {(user.name || user.email)?.charAt(0).toUpperCase() || 'A'}
                      </div>
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-semibold text-purple-200">{user.name || user.fullName || user.FullName || 'Admin'}</p>
                      <p className="text-xs text-purple-400/80">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentView("profile")
                      setIsMenuOpen(false)
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-white hover:bg-purple-600/20 transition-all duration-300 border border-purple-500/20"
                  >
                    <FaUser className="text-purple-400" />
                    <span>View Profile</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-600/20 transition-all duration-300 border border-red-500/20"
                  >
                    <FaSignOutAlt className="text-red-400" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3 px-4 py-3 mb-2 rounded-xl bg-black/40 backdrop-blur-sm border border-purple-500/20 shadow-lg">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center ring-2 ring-purple-500/20">
                    <FaUser className="text-gray-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-400">Guest User</p>
                    <p className="text-xs text-gray-600">Not logged in</p>
                  </div>
                </div>
              )}

              {navItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id)
                    setIsMenuOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 border ${
                    currentView === item.id
                      ? "bg-purple-600/20 text-purple-200 border-purple-500/60 shadow-lg shadow-purple-500/20"
                      : "text-gray-400 hover:text-white border-transparent hover:border-purple-500/30 hover:bg-purple-900/10"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
