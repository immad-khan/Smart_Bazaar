import React, { useState, useMemo } from 'react';

export default function PriceSummary({ searchResults, onSortChange }) {
  const [sortOrder, setSortOrder] = useState('lowest');

  // Combine all products from database and scraped
  const allProducts = useMemo(() => {
    const products = [];
    
    if (searchResults.database && Array.isArray(searchResults.database)) {
      products.push(...searchResults.database.map(p => {
        const priceStr = String(p.price || p.Price || '0').replace(/[^0-9.]/g, '');
        const priceNum = parseFloat(priceStr) || 0;
        console.log('DB Product:', p.name, 'Price String:', p.price, 'Parsed:', priceNum);
        return {
          ...p,
          priceNum,
          source: 'Local'
        };
      }));
    }
    
    if (searchResults.scraped && Array.isArray(searchResults.scraped)) {
      products.push(...searchResults.scraped.map(p => {
        // Handle various price formats: "Rs. 450", "PKR 450", "Rs 450.50", etc.
        const priceStr = String(p.price || '0')
          .replace(/Rs\.?/gi, '')
          .replace(/PKR/gi, '')
          .replace(/,/g, '')
          .replace(/[^0-9.]/g, '');
        const priceNum = parseFloat(priceStr) || 0;
        console.log('Scraped Product:', p.name, 'Price String:', p.price, 'Parsed:', priceNum);
        return {
          ...p,
          priceNum,
          source: 'Online'
        };
      }));
    }
    
    const validProducts = products.filter(p => p.priceNum > 0);
    console.log('Total valid products:', validProducts.length, 'out of', products.length);
    return validProducts;
  }, [searchResults]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (allProducts.length === 0) {
      return { highest: null, lowest: null, average: 0 };
    }

    const validProducts = allProducts.filter(p => p.priceNum > 0);
    const prices = validProducts.map(p => p.priceNum);
    
    const highest = validProducts.reduce((max, p) => p.priceNum > max.priceNum ? p : max, validProducts[0]);
    const lowest = validProducts.reduce((min, p) => p.priceNum < min.priceNum ? p : min, validProducts[0]);
    const average = prices.length > 0 ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(0) : 0;

    return { highest, lowest, average };
  }, [allProducts]);

  const handleSort = (order) => {
    setSortOrder(order);
    onSortChange(order);
  };

  return (
    <div className="rounded-2xl p-6 backdrop-blur-lg border border-purple-400 border-opacity-30 shadow-2xl" style={{ backgroundColor: '#0C0715' }}>
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Price Summary
      </h3>

      <div className="space-y-4 mb-6">
        {/* Highest Price */}
        {stats.highest && (
          <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-md border border-white border-opacity-10 hover:border-opacity-30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm font-medium">Highest Price</span>
              <span className="text-red-400 text-2xl">📈</span>
            </div>
            <p className="text-2xl font-bold text-white">PKR {stats.highest.priceNum.toFixed(0)}</p>
            <p className="text-xs text-gray-400 mt-1 truncate">{stats.highest.name}</p>
          </div>
        )}

        {/* Lowest Price */}
        {stats.lowest && (
          <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-md border border-white border-opacity-10 hover:border-opacity-30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm font-medium">Lowest Price</span>
              <span className="text-green-400 text-2xl">📉</span>
            </div>
            <p className="text-2xl font-bold text-white">PKR {stats.lowest.priceNum.toFixed(0)}</p>
            <p className="text-xs text-gray-400 mt-1 truncate">{stats.lowest.name}</p>
          </div>
        )}

        {/* Average Price */}
        <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-md border border-white border-opacity-10 hover:border-opacity-30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm font-medium">Average Price</span>
            <span className="text-blue-400 text-2xl">📊</span>
          </div>
          <p className="text-2xl font-bold text-white">PKR {stats.average}</p>
          <p className="text-xs text-gray-400 mt-1">{allProducts.length} products analyzed</p>
        </div>
      </div>

      {/* Sort Options */}
      <div className="border-t border-white border-opacity-10 pt-4">
        <p className="text-sm font-medium text-gray-300 mb-3">Sort by Price</p>
        <div className="space-y-2">
          <button
            onClick={() => handleSort('lowest')}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-all text-sm flex items-center justify-between ${
              sortOrder === 'lowest'
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
            }`}
          >
            <span>Low to High</span>
            {sortOrder === 'lowest' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
          </button>
          <button
            onClick={() => handleSort('highest')}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-all text-sm flex items-center justify-between ${
              sortOrder === 'highest'
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
            }`}
          >
            <span>High to Low</span>
            {sortOrder === 'highest' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
          </button>
        </div>
      </div>
    </div>
  );
}
