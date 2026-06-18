import React, { useState, useEffect, useRef } from 'react';
import { ApiService, FloatingParticles } from './SellerComponents';
import { uploadBase64ToCloudinary } from '../utils/cloudinary';

// Store Registration Page Component
export const StoreRegistrationPage = ({ setCurrentPage, user, setStore }) => {
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStoreRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Registering store for user:', user);
      const result = await ApiService.createStore({
        SellerID: user.id || user.Id || user.sellerID,
        StoreName: storeName,
        Address: storeAddress,
        ContactNumber: contactNumber,
        Description: storeDescription
      });
      
      console.log('Store registration result:', result);
      
      if (result && (result.storeId || result.StoreID)) {
        const newStore = {
          StoreID: result.storeId || result.StoreID,
          StoreName: storeName,
          Address: storeAddress,
          ContactNumber: contactNumber,
          Description: storeDescription
        };
        console.log('Setting store state:', newStore);
        setStore(newStore);
        setCurrentPage('products');
      } else {
        const errorMsg = result?.message || result || 'Store registration failed';
        console.error('Registration failed with:', errorMsg);
        setError(typeof errorMsg === 'string' ? errorMsg : 'Store registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Store registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient flex items-center justify-center p-4 relative">
      <FloatingParticles />
      <div className="w-full max-w-2xl relative z-10">
        <div className="bg-black bg-opacity-40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 store-form">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 slide-in-left">Register Your Store</h2>
            <p className="text-gray-300 slide-in-right">Tell us about your business</p>
          </div>
          
          <form onSubmit={handleStoreRegistration} className="space-y-6">
            <div className="slide-in-left">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Store Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:outline-none input-focus transition-all duration-300"
                placeholder="Enter store name"
                required
              />
            </div>
            
            <div className="slide-in-right">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Store Address
              </label>
              <input
                type="text"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:outline-none input-focus transition-all duration-300"
                placeholder="Enter store address"
                required
              />
            </div>
            
            <div className="slide-in-left">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contact Number
              </label>
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:outline-none input-focus transition-all duration-300"
                placeholder="Enter contact number"
                required
              />
            </div>
            
            <div className="slide-in-right">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Store Description
              </label>
              <textarea
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:outline-none input-focus transition-all duration-300 resize-none"
                placeholder="Describe your store and products"
                required
              />
            </div>
            
            {error && (
              <div className="slide-in-left text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg btn-hover ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Registering store...
                </span>
              ) : 'Register Store'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Image Upload Component
export const ImageUpload = ({ onImageUpload, existingImage }) => {
  const [dragging, setDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState(existingImage || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file) => {
    if (file && file.type.startsWith('image/')) {
      setUploading(true);
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64String = e.target.result;
          setImagePreview(base64String);
          
          // Upload to Cloudinary
          const cloudinaryUrl = await uploadBase64ToCloudinary(base64String);
          console.log('Uploaded to Cloudinary:', cloudinaryUrl);
          onImageUpload(cloudinaryUrl);
          setUploading(false);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Failed to upload image. Please try again.');
        setUploading(false);
      }
    }
  };

  const handleButtonClick = () => {
    if (!uploading) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`image-upload-area rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${dragging ? 'dragover' : ''} ${uploading ? 'opacity-50 cursor-wait' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        {uploading ? (
          <div className="space-y-4">
            <svg className="animate-spin mx-auto h-12 w-12 text-purple-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-300 font-medium">Uploading to cloud...</p>
          </div>
        ) : imagePreview ? (
          <div className="space-y-4">
            <img src={imagePreview} alt="Preview" className="mx-auto rounded-lg max-h-48" />
            <p className="text-gray-400 text-sm">Click to change image</p>
          </div>
        ) : (
          <div className="space-y-4">
            <svg className="mx-auto w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div>
              <p className="text-gray-300 font-medium">Drop image here or click to upload</p>
              <p className="text-gray-500 text-sm">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
