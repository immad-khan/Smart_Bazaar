const API_BASE_URL = '/api';

let model = null;

// ─── Persistent browser cache (localStorage) ───────────────────────────────
const CACHE_PREFIX   = 'sb_cache_';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 day in milliseconds
const MAX_CACHE_KEYS = 50;

function cacheGet(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function cacheSet(key, data) {
  try {
    // Evict oldest entries if we have too many
    const allKeys = Object.keys(localStorage)
      .filter(k => k.startsWith(CACHE_PREFIX));
    if (allKeys.length >= MAX_CACHE_KEYS) {
      // Remove the oldest entry
      const oldest = allKeys
        .map(k => ({ k, ts: JSON.parse(localStorage.getItem(k) || '{"timestamp":0}').timestamp }))
        .sort((a, b) => a.ts - b.ts)[0];
      if (oldest) localStorage.removeItem(oldest.k);
    }
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // localStorage full or unavailable – skip caching silently
  }
}
// ───────────────────────────────────────────────────────────────────────────

// Load MobileNet model for image classification
export const loadImageModel = async () => {
  if (model) return model;
  
  try {
    // Dynamically import TensorFlow.js
    const tf = await import('@tensorflow/tfjs');
    const mobilenet = await import('@tensorflow-models/mobilenet');
    
    console.log('Loading MobileNet model...');
    model = await mobilenet.load();
    console.log('MobileNet model loaded successfully!');
    return model;
  } catch (error) {
    console.error('Error loading model:', error);
    throw error;
  }
};

export const recognizeImage = async (imageFile) => {
  try {
    // Load MobileNet model (runs in browser)
    const loadedModel = await loadImageModel();
    
    // Create image element
    const img = new Image();
    const imageUrl = URL.createObjectURL(imageFile);
    
    return new Promise((resolve, reject) => {
      img.onload = async () => {
        try {
          // Classify image using MobileNet
          const predictions = await loadedModel.classify(img);
          console.log('✅ Image recognition results:', predictions);
          
          // Clean up
          URL.revokeObjectURL(imageUrl);
          
          if (predictions && predictions.length > 0) {
            // Return top predictions
            resolve(predictions.map(p => ({
              label: p.className,
              score: p.probability
            })));
          } else {
            resolve({ 
              error: true, 
              message: 'Could not recognize the image. Please try text search.' 
            });
          }
        } catch (error) {
          console.error('Classification error:', error);
          URL.revokeObjectURL(imageUrl);
          resolve({ 
            error: true, 
            message: 'Image recognition failed. Please try text search.' 
          });
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        resolve({ 
          error: true, 
          message: 'Failed to load image. Please try again.' 
        });
      };
      
      img.src = imageUrl;
    });
  } catch (error) {
    console.error('Image Recognition Error:', error);
    return { 
      error: true, 
      message: 'AI model is loading. Please wait a moment and try again.' 
    };
  }
};

export const searchProducts = async (query) => {
  try {
    // Check persistent browser cache first (survives page reloads for 1 day)
    const cacheKey = query.toLowerCase().trim();
    const cached = cacheGet(cacheKey);

    if (cached) {
      console.log('✅ Returning cached results for:', query);
      return cached;
    }

    console.log('🔍 Fetching fresh results for:', query);
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Search failed');
    }
    const data = await response.json();

    // Store in localStorage cache (expires after 1 day)
    cacheSet(cacheKey, data);
    console.log('💾 Cached results in localStorage for 1 day.');

    return data;
  } catch (error) {
    console.error('API Error:', error);
    return { error: 'Search failed. Please try again.', totalResults: 0 };
  }
};

export const scrapeProduct = async (url) => {
  try {
    const response = await fetch(`${API_BASE_URL}/scraper/test-naheed?url=${encodeURIComponent(url)}`);
    if (!response.ok) {
      throw new Error('Scrape failed');
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
};

export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error('Health check failed');
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
};
