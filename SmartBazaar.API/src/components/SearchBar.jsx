import React, { useState, useRef, useEffect } from 'react';
import '../styles/SearchBar.css';

export default function SearchBar({ onSearch, onCameraClick, loading = false, isRecognizing = false }) {
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const buttonRef = useRef(null);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 100);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      if (buttonRef.current) {
        buttonRef.current.style.animation = 'none';
        setTimeout(() => {
          if (buttonRef.current) {
            buttonRef.current.style.animation = 'buttonPulse 2.5s ease-in-out infinite';
          }
        }, 150);
      }
      onSearch(query);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <div className="search-container">
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for products, brands, and more..."
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className={isTyping ? 'typing' : ''}
          disabled={loading}
        />
        <button
          type="button"
          className="camera-btn"
          onClick={onCameraClick}
          disabled={isRecognizing || loading}
          title="Search by image"
        >
          {isRecognizing ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
        <button
          ref={buttonRef}
          type="submit"
          className="search-btn"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
    </div>
  );
}
