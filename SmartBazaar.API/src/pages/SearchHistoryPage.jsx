import React, { useState, useEffect } from 'react';
import { FaSearch, FaClock, FaTrash, FaRedo, FaHistory, FaSyncAlt, FaChartLine, FaBolt, FaEye } from 'react-icons/fa';

export default function SearchHistoryPage({ onSearch }) {
  const [searchHistory, setSearchHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const loadHistory = () => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setSearchHistory(history);
        setFilteredHistory(history);
        console.log('Loaded search history:', history);
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    } else {
      console.log('No search history found in localStorage');
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (filterText) {
      const filtered = searchHistory.filter(item =>
        item.query.toLowerCase().includes(filterText.toLowerCase())
      );
      setFilteredHistory(filtered);
    } else {
      setFilteredHistory(searchHistory);
    }
  }, [filterText, searchHistory]);

  const handleDelete = (index) => {
    const updatedHistory = searchHistory.filter((_, i) => i !== index);
    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all search history?')) {
      setSearchHistory([]);
      setFilteredHistory([]);
      localStorage.removeItem('searchHistory');
    }
  };

  const handleSearchAgain = (query) => {
    if (onSearch) {
      onSearch(query);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0715] py-8 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-br from-black/60 to-purple-950/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 shadow-2xl shadow-purple-500/10 p-6 mb-6 hover:border-purple-500/40 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white flex items-center group">
              <div className="relative mr-3">
                <FaHistory className="w-8 h-8 text-purple-500 animate-pulse" />
                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
              </div>
              Search History
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={loadHistory}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-500 hover:to-purple-600 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 font-medium"
              >
                <FaSyncAlt className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              {searchHistory.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 font-medium"
                >
                  <FaTrash className="w-4 h-4" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Input */}
          <div className="relative group">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5 group-focus-within:text-purple-300 transition-colors" />
            <input
              type="text"
              placeholder="Filter search history..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-black/40 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
            />
          </div>
        </div>

        {/* Search History List */}
        <div className="space-y-4">
          {filteredHistory.length === 0 ? (
            <div className="bg-gradient-to-br from-black/60 to-purple-950/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 shadow-2xl p-12 text-center">
              <div className="relative inline-block mb-6">
                <FaClock className="w-20 h-20 text-purple-500/30 animate-pulse" />
                <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-2xl" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-300 mb-2">
                {searchHistory.length === 0 ? 'No Search History' : 'No Results Found'}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchHistory.length === 0 
                  ? 'Your search history will appear here as you search for products.'
                  : 'Try adjusting your filter to find what you\'re looking for.'
                }
              </p>
            </div>
          ) : (
            filteredHistory.map((item, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="bg-gradient-to-br from-black/60 to-purple-950/40 backdrop-blur-xl rounded-xl border border-purple-500/20 p-5 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex items-center gap-4">
                    <div className="relative">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-900/20 flex items-center justify-center border border-purple-500/30 group-hover:border-purple-500/60 transition-all duration-300 ${hoveredIndex === index ? 'scale-110 rotate-3' : ''}`}
                      >
                        <FaSearch className="w-5 h-5 text-purple-400" />
                      </div>
                      {hoveredIndex === index && (
                        <div className="absolute inset-0 bg-purple-500/20 rounded-xl blur-xl animate-pulse" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                        {item.query}
                        {hoveredIndex === index && <FaBolt className="w-4 h-4 text-yellow-400 animate-pulse" />}
                      </h3>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center text-gray-400">
                          <FaClock className="w-3.5 h-3.5 mr-1.5" />
                          {formatDate(item.timestamp)}
                        </span>
                        {item.resultsCount !== undefined && (
                          <span className="flex items-center gap-1.5 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-lg border border-purple-500/30 font-medium">
                            <FaEye className="w-3.5 h-3.5" />
                            {item.resultsCount} results
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSearchAgain(item.query)}
                      className="p-3 bg-purple-600/20 text-purple-300 rounded-xl hover:bg-purple-600/40 hover:text-purple-200 transition-all duration-300 border border-purple-500/30 hover:border-purple-500/60 hover:scale-110"
                      title="Search again"
                    >
                      <FaRedo className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="p-3 bg-red-600/20 text-red-300 rounded-xl hover:bg-red-600/40 hover:text-red-200 transition-all duration-300 border border-red-500/30 hover:border-red-500/60 hover:scale-110"
                      title="Delete"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Statistics */}
        {searchHistory.length > 0 && (
          <div className="bg-gradient-to-br from-black/60 to-purple-950/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 shadow-2xl shadow-purple-500/10 p-6 mt-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FaChartLine className="w-6 h-6 text-purple-400 animate-pulse" />
              Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative group overflow-hidden">
                <div className="bg-gradient-to-br from-purple-600/30 to-purple-900/30 p-6 rounded-xl text-center border border-purple-500/40 hover:border-purple-500/70 transition-all duration-300 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <p className="text-5xl font-bold text-purple-300 mb-2 relative z-10">{searchHistory.length}</p>
                  <p className="text-sm text-gray-400 font-medium relative z-10">Total Searches</p>
                </div>
              </div>

              <div className="relative group overflow-hidden">
                <div className="bg-gradient-to-br from-blue-600/30 to-blue-900/30 p-6 rounded-xl text-center border border-blue-500/40 hover:border-blue-500/70 transition-all duration-300 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <p className="text-5xl font-bold text-blue-300 mb-2 relative z-10">
                    {new Set(searchHistory.map(h => h.query)).size}
                  </p>
                  <p className="text-sm text-gray-400 font-medium relative z-10">Unique Queries</p>
                </div>
              </div>

              <div className="relative group overflow-hidden">
                <div className="bg-gradient-to-br from-green-600/30 to-green-900/30 p-6 rounded-xl text-center border border-green-500/40 hover:border-green-500/70 transition-all duration-300 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-600/0 to-green-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <p className="text-5xl font-bold text-green-300 mb-2 relative z-10">
                    {searchHistory.filter(h => {
                      const date = new Date(h.timestamp);
                      const today = new Date();
                      return date.toDateString() === today.toDateString();
                    }).length}
                  </p>
                  <p className="text-sm text-gray-400 font-medium relative z-10">Today's Searches</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
