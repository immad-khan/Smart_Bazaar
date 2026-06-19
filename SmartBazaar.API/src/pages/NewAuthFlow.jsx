import { useState } from 'react';
import { FaEnvelope, FaLock, FaUser, FaPhone, FaStore, FaMapMarkerAlt, FaFileAlt, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function NewAuthFlow({ onAuthSuccess }) {
  const [view, setView] = useState('login'); // login, register, verify-email, seller-info, pending
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    confirmationCode: '',
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    taxId: ''
  });
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setUserId(data.userId);
      setSuccess('Registration successful! Please check your email for confirmation code.');
      setTimeout(() => setView('verify-email'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          code: formData.confirmationCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      setSuccess('Email verified! Please provide your business information.');
      setTimeout(() => setView('seller-info'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Resend failed');
      }

      setSuccess('Confirmation code resent! Please check your email.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSellerInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/request-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          businessName: formData.businessName,
          businessAddress: formData.businessAddress,
          businessPhone: formData.businessPhone,
          taxId: formData.taxId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      setSuccess('Application submitted successfully!');
      setTimeout(() => setView('pending'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('seller', JSON.stringify(data.user));
      setSuccess('Login successful!');
      setTimeout(() => onAuthSuccess(data.user), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0715] via-black to-purple-950/50 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-800/5 rounded-full blur-3xl" />
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Login View */}
        {view === 'login' && (
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-purple-900/50 p-8 shadow-2xl shadow-black/50">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-purple-300/70 text-sm">Sign in to access your account</p>
            </div>
            
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-purple-200/80 mb-2 text-sm font-medium uppercase tracking-wide">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-black/40 border border-purple-900/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-600/50 focus:border-purple-600 transition-all placeholder-purple-400/30"
                    placeholder="admin@smartbazaar.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-200/80 mb-2 text-sm font-medium uppercase tracking-wide">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-12 pr-12 py-3.5 bg-black/40 border border-purple-900/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-600/50 focus:border-purple-600 transition-all placeholder-purple-400/30"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-500 hover:text-purple-400 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/30 hover:shadow-purple-800/40 mt-6"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-purple-300/70 text-sm">
                Don't have an account?{' '}
                <button
                  onClick={() => setView('register')}
                  className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                >
                  Register
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Register View */}
        {view === 'register' && (
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-950/20 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Create Account</h2>
            
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-purple-200 mb-2 text-sm">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-purple-950/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-200 mb-2 text-sm">Email</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-purple-950/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-200 mb-2 text-sm">Phone Number</label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-purple-950/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="+92 300 1234567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-200 mb-2 text-sm">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-purple-950/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-purple-300">
                Already have an account?{' '}
                <button
                  onClick={() => setView('login')}
                  className="text-purple-400 hover:text-purple-300 font-semibold"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Email Verification View */}
        {view === 'verify-email' && (
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-950/20 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-4 text-center">Verify Email</h2>
            <p className="text-purple-300 text-center mb-6">
              We sent a 6-digit code to {formData.email}
            </p>
            
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div>
                <label className="block text-purple-200 mb-2 text-sm">Confirmation Code</label>
                <input
                  type="text"
                  name="confirmationCode"
                  value={formData.confirmationCode}
                  onChange={handleInputChange}
                  required
                  maxLength="6"
                  className="w-full px-4 py-3 bg-purple-950/30 border border-purple-500/30 rounded-lg text-white text-center text-2xl tracking-widest focus:outline-none focus:border-purple-500"
                  placeholder="000000"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="w-full text-purple-400 hover:text-purple-300 font-semibold py-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resend Code
              </button>
            </form>
          </div>
        )}

        {/* Seller Info View */}
        {view === 'seller-info' && (
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-950/20 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-4 text-center">Business Information</h2>
            <p className="text-purple-300 text-center mb-6">
              Tell us about your business
            </p>
            
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleSellerInfo} className="space-y-4">
              <div>
                <label className="block text-purple-200 mb-2 text-sm">Business Name</label>
                <div className="relative">
                  <FaStore className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-purple-950/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="ABC Store"
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-200 mb-2 text-sm">Business Address</label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-3 text-purple-400" />
                  <textarea
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full pl-10 pr-4 py-3 bg-purple-950/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="123 Main Street, City, Pakistan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-200 mb-2 text-sm">Business Phone</label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
                  <input
                    type="tel"
                    name="businessPhone"
                    value={formData.businessPhone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-purple-950/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="+92 21 12345678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-200 mb-2 text-sm">Tax ID (Optional)</label>
                <div className="relative">
                  <FaFileAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-purple-950/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="NTN-1234567-8"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit for Approval'}
              </button>
            </form>
          </div>
        )}

        {/* Pending Approval View */}
        {view === 'pending' && (
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-950/20 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-8 shadow-2xl text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Pending Admin Approval</h2>
              <p className="text-purple-300 mb-6">
                Your application has been submitted successfully. Our admin team will review your request and notify you via email once approved.
              </p>
              <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-purple-200">
                  This usually takes 1-2 business days. You'll receive an email notification once your account is approved.
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setView('login')}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 rounded-lg transition-all"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
