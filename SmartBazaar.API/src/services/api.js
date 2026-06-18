const API_BASE_URL = '/api';

let model = null;

// In-memory cache for scraped data
const searchCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

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
    // Check cache first
    const cacheKey = query.toLowerCase().trim();
    const cached = searchCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('✅ Returning cached results for:', query);
      return cached.data;
    }
    
    console.log('🔍 Fetching fresh results for:', query);
    // Fetch from API
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Search failed');
    }
    const data = await response.json();
    
    // Store in cache
    searchCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    console.log('💾 Cached results. Cache size:', searchCache.size);
    
    // Clean old cache entries (keep max 50 items)
    if (searchCache.size > 50) {
      const firstKey = searchCache.keys().next().value;
      searchCache.delete(firstKey);
    }
    
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
