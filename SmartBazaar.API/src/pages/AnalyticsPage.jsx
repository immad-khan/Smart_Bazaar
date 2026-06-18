import React, { useState, useEffect } from 'react';
import { FaChartLine, FaShoppingCart, FaDollarSign, FaUsers, FaTrophy } from 'react-icons/fa';

export default function AnalyticsPage() {
  const [timePeriod, setTimePeriod] = useState("week");
  const [analytics, setAnalytics] = useState({
    totalSearches: 0,
    totalProducts: 0,
    averagePrice: 0,
    topSearches: [],
    searchTrends: [],
    priceComparisons: [],
  });

  useEffect(() => {
    // Load analytics data from localStorage and calculate stats
    const searchHistory = JSON.parse(localStorage.getItem("searchHistory") || "[]")

    const now = new Date()
    const filteredHistory = searchHistory.filter((item) => {
      const itemDate = new Date(item.timestamp)
      const diffTime = now.getTime() - itemDate.getTime()
      const diffDays = diffTime / (1000 * 60 * 60 * 24)

      if (timePeriod === "day") return diffDays <= 1
      if (timePeriod === "week") return diffDays <= 7
      if (timePeriod === "month") return diffDays <= 30
      return true
    })

    // Calculate top searches
    const searchCounts = {}
    filteredHistory.forEach((item) => {
      searchCounts[item.query] = (searchCounts[item.query] || 0) + 1
    })

    const topSearches = Object.entries(searchCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([query, count]) => ({ query, count }))

    // Calculate trends by day
    const trendsByDay = {}
    filteredHistory.forEach((item) => {
      const date = new Date(item.timestamp).toLocaleDateString()
      trendsByDay[date] = (trendsByDay[date] || 0) + 1
    })

    const searchTrends = Object.entries(trendsByDay)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(-7)

    setAnalytics({
      totalSearches: filteredHistory.length,
      totalProducts: filteredHistory.reduce((sum, item) => sum + (item.resultsCount || 0), 0),
      averagePrice: 0,
      topSearches,
      searchTrends,
      priceComparisons: [],
    })
  }, [timePeriod])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white flex items-center">
            <FaChartLine className="mr-4 text-purple-400" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Track your shopping insights and trends</p>
        </div>

        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setTimePeriod("day")}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
              timePeriod === "day"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Last Day
          </button>
          <button
            onClick={() => setTimePeriod("week")}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
              timePeriod === "week"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Last Week
          </button>
          <button
            onClick={() => setTimePeriod("month")}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
              timePeriod === "month"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Last Month
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl border border-purple-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-600/20 rounded-lg border border-purple-500/30">
                <FaChartLine className="text-2xl text-purple-400" />
              </div>
              <span className="text-sm text-green-400 font-semibold">+12%</span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Total Searches</h3>
            <p className="text-3xl font-bold text-white">{analytics.totalSearches}</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl border border-purple-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-600/20 rounded-lg border border-purple-500/30">
                <FaShoppingCart className="text-2xl text-purple-400" />
              </div>
              <span className="text-sm text-green-400 font-semibold">+8%</span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Products Viewed</h3>
            <p className="text-3xl font-bold text-white">{analytics.totalProducts}</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl border border-purple-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-600/20 rounded-lg border border-purple-500/30">
                <FaDollarSign className="text-2xl text-purple-400" />
              </div>
              <span className="text-sm text-red-400 font-semibold">-5%</span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Avg. Price</h3>
            <p className="text-3xl font-bold text-white">PKR {analytics.averagePrice.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Search Trends */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl border border-purple-500/20 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Search Trends</h2>
            <div className="space-y-4">
              {analytics.searchTrends.length > 0 ? (
                analytics.searchTrends.map(([date, count], index) => {
                  const maxCount = Math.max(...analytics.searchTrends.map((t) => t[1]))
                  const width = (count / maxCount) * 100

                  return (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">{date}</span>
                        <span className="font-semibold text-purple-300">{count} searches</span>
                      </div>
                      <div className="h-3 bg-gray-950/50 rounded-full overflow-hidden border border-purple-900/30">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-500 shadow-lg shadow-purple-500/50"
                          style={{ width: `${width}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-gray-500 text-center py-8">No search data available yet</p>
              )}
            </div>
          </div>

          {/* Top Searches */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl border border-purple-500/20 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Top Searches</h2>
            <div className="space-y-3">
              {analytics.topSearches.length > 0 ? (
                analytics.topSearches.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-950/50 rounded-lg border border-purple-900/30 hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                          index === 0
                            ? "bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-yellow-500/50"
                            : index === 1
                              ? "bg-gradient-to-br from-gray-400 to-gray-500 shadow-gray-500/50"
                              : index === 2
                                ? "bg-gradient-to-br from-orange-600 to-orange-700 shadow-orange-600/50"
                                : "bg-gradient-to-br from-purple-600 to-purple-700 shadow-purple-600/50"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="font-medium text-white">{item.query}</span>
                    </div>
                    <span className="bg-purple-600/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-sm font-semibold">
                      {item.count} times
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No search data available yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl border border-purple-500/20 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Price Comparison Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-8 bg-gradient-to-br from-purple-950/50 to-purple-900/30 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all">
              <FaUsers className="text-5xl text-purple-400 mx-auto mb-4" />
              <p className="text-3xl font-bold text-white mb-2">15</p>
              <p className="text-gray-400 text-sm">Stores Compared</p>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-purple-950/50 to-purple-900/30 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all">
              <FaTrophy className="text-5xl text-purple-400 mx-auto mb-4" />
              <p className="text-3xl font-bold text-white mb-2">PKR 5,200</p>
              <p className="text-gray-400 text-sm">Best Deal Found</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
