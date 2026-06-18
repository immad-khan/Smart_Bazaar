import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSignOutAlt, FaChevronRight } from 'react-icons/fa';

export default function ProfilePage({ user, setUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: 'Admin'
  });

  useEffect(() => {
    setMounted(true);
    if (user) {
      setFormData({
        name: user.name || user.fullName || user.FullName || 'Admin User',
        email: user.email || '',
        phone: user.phone || user.PhoneNumber || '',
        address: user.address || user.Address || '',
        role: user.role || 'Admin'
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    setUser(formData);
    
    const sellerData = localStorage.getItem('seller');
    if (sellerData) {
      const seller = JSON.parse(sellerData);
      seller.FirstName = formData.name.split(' ')[0] || '';
      seller.LastName = formData.name.split(' ').slice(1).join(' ') || '';
      seller.Email = formData.email;
      seller.PhoneNumber = formData.phone;
      seller.Address = formData.address;
      localStorage.setItem('seller', JSON.stringify(seller));
      window.dispatchEvent(new Event('storage'));
    }
    
    setIsEditing(false);
    console.log('Saving profile:', formData);
  };

  const handleLogout = () => {
    localStorage.removeItem('seller');
    localStorage.removeItem('authToken');
    window.location.reload();
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0B0715]">
      {/* Animated background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-600/10 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-5xl font-bold mb-3 text-white">Profile Overview</h1>
              <p className="text-purple-300 text-lg">Manage your personal information and account settings</p>
            </div>
            <div className="flex gap-3">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300 hover:scale-105 font-medium"
                  >
                    <FaEdit className="h-4 w-4" />
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-6 py-3 border border-red-500 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-300 font-medium"
                  >
                    <FaSignOutAlt className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300 hover:scale-105 font-medium"
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="p-8 bg-gradient-to-br from-purple-900/30 to-purple-950/20 backdrop-blur-xl rounded-2xl border border-purple-500/20 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 flex items-center justify-center shadow-2xl ring-4 ring-purple-500/30 transition-all duration-500 hover:scale-110 hover:rotate-6">
                      <FaUser className="h-16 w-16 text-white" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center shadow-lg border-2 border-purple-900">
                      <span className="text-white font-bold text-sm">{formData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2 text-white">{formData.name}</h2>
                  <p className="text-purple-300 text-sm uppercase tracking-wider">{formData.role}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-950/30 hover:bg-purple-950/50 transition-colors border border-purple-500/20">
                    <FaEnvelope className="h-5 w-5 text-purple-400" />
                    <span className="text-sm text-purple-200">Email verified</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-950/30 hover:bg-purple-950/50 transition-colors border border-purple-500/20">
                    <FaPhone className="h-5 w-5 text-purple-400" />
                    <span className="text-sm text-purple-200">Phone linked</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-purple-600/10 border border-purple-500/30 rounded-xl hover:border-purple-500/50 transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="text-3xl font-bold text-purple-400 mb-1">24</div>
                <div className="text-xs text-purple-300 uppercase tracking-wide">Projects</div>
              </div>
              <div className="p-4 bg-purple-600/10 border border-purple-500/30 rounded-xl hover:border-purple-500/50 transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="text-3xl font-bold text-purple-400 mb-1">156</div>
                <div className="text-xs text-purple-300 uppercase tracking-wide">Tasks</div>
              </div>
            </div>
          </div>

          {/* Right Column - Information Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Name Card */}
            <div className="p-6 bg-gradient-to-br from-purple-900/30 to-purple-950/20 backdrop-blur-xl rounded-2xl border border-purple-500/20 hover:shadow-xl hover:border-purple-500/40 transition-all duration-500 group">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-purple-600/20 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600/30 transition-colors duration-300">
                  <FaUser className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-purple-300 mb-2 uppercase tracking-wide">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-purple-950/30 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all"
                    />
                  ) : (
                    <p className="text-xl font-semibold text-white">{formData.name}</p>
                  )}
                </div>
                <FaChevronRight className="h-5 w-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Email Card */}
            <div className="p-6 bg-gradient-to-br from-purple-900/30 to-purple-950/20 backdrop-blur-xl rounded-2xl border border-purple-500/20 hover:shadow-xl hover:border-purple-500/40 transition-all duration-500 group">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-purple-600/20 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600/30 transition-colors duration-300">
                  <FaEnvelope className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-purple-300 mb-2 uppercase tracking-wide">
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-purple-950/30 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all"
                    />
                  ) : (
                    <p className="text-xl font-semibold text-white">{formData.email}</p>
                  )}
                </div>
                <FaChevronRight className="h-5 w-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Phone Card */}
            <div className="p-6 bg-gradient-to-br from-purple-900/30 to-purple-950/20 backdrop-blur-xl rounded-2xl border border-purple-500/20 hover:shadow-xl hover:border-purple-500/40 transition-all duration-500 group">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-purple-600/20 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600/30 transition-colors duration-300">
                  <FaPhone className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-purple-300 mb-2 uppercase tracking-wide">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-purple-950/30 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all"
                    />
                  ) : (
                    <p className="text-xl font-semibold text-white">{formData.phone || 'Not provided'}</p>
                  )}
                </div>
                <FaChevronRight className="h-5 w-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Address Card */}
            <div className="p-6 bg-gradient-to-br from-purple-900/30 to-purple-950/20 backdrop-blur-xl rounded-2xl border border-purple-500/20 hover:shadow-xl hover:border-purple-500/40 transition-all duration-500 group">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-purple-600/20 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600/30 transition-colors duration-300">
                  <FaMapMarkerAlt className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-purple-300 mb-2 uppercase tracking-wide">
                    Address
                  </label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-purple-950/30 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all resize-none"
                    />
                  ) : (
                    <p className="text-xl font-semibold text-white">{formData.address || 'Not provided'}</p>
                  )}
                </div>
                <FaChevronRight className="h-5 w-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
