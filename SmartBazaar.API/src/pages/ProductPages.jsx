import React, { useState, useEffect } from 'react';
import { ApiService, FloatingParticles } from './SellerComponents';
import { ImageUpload } from './StorePages';

// Add Product Page Component
export const AddProductPage = ({ setCurrentPage, user, store }) => {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!store) {
      setError('Store information missing. Please re-register or contact support.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await ApiService.addProduct({
        StoreID: store.storeID || store.StoreID,
        ProductName: productName,
        Description: productDescription,
        Price: parseFloat(price),
        StockQuantity: parseInt(stock),
        Category: category,
        ImageUrl: productImage
      });
      
      if (result.productId) {
        setProductName('');
        setProductDescription('');
        setPrice('');
        setStock('');
        setCategory('');
        setProductImage(null);
        
        alert('Product added successfully!');
        setCurrentPage('products');
      } else {
        setError(result.message || 'Failed to add product');
      }
    } catch (err) {
      setError('Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient relative">
      <FloatingParticles />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="bg-black bg-opacity-40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 fade-in-up">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 slide-in-left">Add New Product</h2>
            <p className="text-gray-300 slide-in-right">Enter product details below</p>
          </div>
          
          <form onSubmit={handleAddProduct} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="slide-in-left">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:outline-none input-focus transition-all duration-300"
                  placeholder="Enter product name"
                  required
                />
              </div>
              
              <div className="slide-in-right">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price (PKR)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:outline-none input-focus transition-all duration-300"
                  placeholder="Enter price"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>
              
              <div className="slide-in-left">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:outline-none input-focus transition-all duration-300"
                  required
                >
                  <option value="">Select category</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="food">Food & Beverages</option>
                  <option value="home">Home & Garden</option>
                  <option value="sports">Sports & Outdoors</option>
                </select>
              </div>
              
              <div className="slide-in-right">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:outline-none input-focus transition-all duration-300"
                  placeholder="Enter stock quantity"
                  min="1"
                  required
                />
              </div>
            </div>
            
            <div className="slide-in-left">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Product Image
              </label>
              <ImageUpload 
                onImageUpload={setProductImage} 
                existingImage={productImage}
              />
            </div>
            
            <div className="slide-in-right">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Product Description
              </label>
              <textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:outline-none input-focus transition-all duration-300 resize-none"
                placeholder="Describe your product"
                required
              />
            </div>
            
            {error && (
              <div className="slide-in-left text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <div className="flex justify-between items-center slide-in-left">
              <button
                type="button"
                onClick={() => setCurrentPage('products')}
                className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all duration-300"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg btn-hover ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Adding product...
                  </span>
                ) : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Edit Product Page Component
export const EditProductPage = ({ setCurrentPage, user, product, store }) => {
  const [productName, setProductName] = useState(product?.name || '');
  const [productDescription, setProductDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price || '');
  const [stock, setStock] = useState(product?.stockQuantity || '');
  const [category, setCategory] = useState(product?.category || '');
  const [productImage, setProductImage] = useState(product?.imageUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!store) {
      setError('Store information missing.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await ApiService.updateProduct({
        ProductID: product.id,
        StoreID: store.storeID || store.StoreID,
        ProductName: productName,
        Description: productDescription,
        Price: parseFloat(price),
        StockQuantity: parseInt(stock),
        Category: category,
        ImageUrl: productImage
      });
      
      if (result.productId) {
        alert('Product updated successfully!');
        setCurrentPage('products');
      } else {
        setError(result.message || 'Failed to update product');
      }
    } catch (err) {
      setError('Failed to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient relative">
      <FloatingParticles />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="bg-black bg-opacity-40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 fade-in-up">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 slide-in-left">Edit Product</h2>
            <p className="text-gray-300 slide-in-right">Update product details</p>
          </div>
          
          <form onSubmit={handleUpdateProduct} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="slide-in-left">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:outline-none input-focus transition-all duration-300"
                  placeholder="Enter product name"
                  required
                />
              </div>
              
              <div className="slide-in-right">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price (PKR)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:outline-none input-focus transition-all duration-300"
                  placeholder="Enter price"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>
              
              <div className="slide-in-left">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:outline-none input-focus transition-all duration-300"
                  required
                >
                  <option value="">Select category</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="food">Food & Beverages</option>
                  <option value="home">Home & Garden</option>
                  <option value="sports">Sports & Outdoors</option>
                </select>
              </div>
              
              <div className="slide-in-right">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:outline-none input-focus transition-all duration-300"
                  placeholder="Enter stock quantity"
                  min="1"
                  required
                />
              </div>
            </div>
            
            <div className="slide-in-left">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Product Image
              </label>
              <ImageUpload 
                onImageUpload={setProductImage} 
                existingImage={productImage}
              />
            </div>
            
            <div className="slide-in-right">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Product Description
              </label>
              <textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:outline-none input-focus transition-all duration-300 resize-none"
                placeholder="Describe your product"
                required
              />
            </div>
            
            {error && (
              <div className="slide-in-left text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <div className="flex justify-between items-center slide-in-left">
              <button
                type="button"
                onClick={() => setCurrentPage('products')}
                className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all duration-300"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg btn-hover ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Updating product...
                  </span>
                ) : 'Update Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Product Card Component
export const ProductCard = ({ product, onEdit, onDelete }) => {
  return (
    <div className="bg-gray-800 bg-opacity-50 rounded-lg overflow-hidden product-card">
      <div className="h-48 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <svg className="w-16 h-16 text-white opacity-50" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-2">{product.name}</h3>
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-purple-400">PKR {product.price}</span>
          <span className="text-sm text-gray-400">Stock: {product.stockQuantity}</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300"
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Products Management Page Component
export const ProductsPage = ({ setCurrentPage, user, store }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const storeId = store?.storeID || store?.StoreID;
        if (!storeId) {
          setLoading(false);
          return;
        }
        const result = await ApiService.getProductsByStoreId(storeId);
        setProducts(result);
        setLoading(false);
      } catch (err) {
        setError('Failed to load products');
        setLoading(false);
      }
    };
    
    if (user && store) {
      fetchProducts();
    } else if (user && !store) {
      // If user exists but no store, loading will finish (SellerHub will redirect to store registration)
      setLoading(false);
    }
  }, [user, store]);

  const handleEdit = (product) => {
    setCurrentPage('editProduct', product);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await ApiService.deleteProduct(productId);
        setProducts(products.filter(p => (p.productID || p.ProductID) !== productId));
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  const handleAddNew = () => {
    setCurrentPage('addProduct');
  };

  return (
    <div className="min-h-screen bg-gradient relative">
      <FloatingParticles />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="bg-black bg-opacity-40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 fade-in-up">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2 slide-in-left">My Products</h2>
              <p className="text-gray-300 slide-in-right">Manage your product inventory</p>
            </div>
            <button
              onClick={handleAddNew}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg btn-hover hover:from-purple-700 hover:to-pink-700"
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New Product
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <svg className="animate-spin h-12 w-12 mx-auto text-purple-400 mb-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-300">Loading products...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-400">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-24 h-24 mx-auto text-gray-500 mb-4 float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No products yet</h3>
              <p className="text-gray-400 mb-6">Start by adding your first product</p>
              <button
                onClick={handleAddNew}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg btn-hover hover:from-purple-700 hover:to-pink-700"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard 
                  key={product.productID || product.ProductID} 
                  product={product} 
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
