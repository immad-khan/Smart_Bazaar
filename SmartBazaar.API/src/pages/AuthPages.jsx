import React, { useState } from 'react';
import { ApiService, FloatingParticles } from './SellerComponents';

// Login Page Component
export const LoginPage = ({ setCurrentPage, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await ApiService.loginSeller({ Email: email, Password: password });
      if (result.sellerId) {
        setUser({ id: result.sellerId, email });
        localStorage.setItem('user', JSON.stringify({ id: result.sellerId, email }));
        setCurrentPage('products');
      } else {
        setError(result.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient flex items-center justify-center p-4 relative">
      <FloatingParticles />
      <div className="w-full max-w-md relative z-10">
        <div className="bg-black bg-opacity-40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 login-form">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 slide-in-left">Welcome Back</h2>
            <p className="text-gray-300 slide-in-right">Sign in to your seller account</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="slide-in-left">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:outline-none input-focus transition-all duration-300"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="slide-in-right">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:outline-none input-focus transition-all duration-300"
                placeholder="Enter your password"
                required
              />
            </div>
            
            {error && (
              <div className="slide-in-left text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <div className="flex items-center justify-between slide-in-left">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                />
                <label className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm text-purple-400 hover:text-purple-300">
                Forgot password?
              </a>
            </div>
            
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
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 text-center slide-in-right">
            <p className="text-gray-300">
              Don't have an account?{' '}
              <a 
                href="#" 
                onClick={() => setCurrentPage('signup')}
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sign Up Page Component
export const SignupPage = ({ setCurrentPage, setUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const nameParts = name.trim().split(/\s+/);
      const payload = {
        FirstName: nameParts[0],
        LastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0],
        Email: email,
        Password: password,
        PhoneNumber: phone
      };
      console.log('Sending registration data:', JSON.stringify(payload, null, 2));
      const result = await ApiService.registerSeller(payload);
      console.log('Registration result:', JSON.stringify(result, null, 2));
      
      if (result.sellerId) {
        setUser({ id: result.sellerId, email });
        localStorage.setItem('user', JSON.stringify({ id: result.sellerId, email }));
        setCurrentPage('store');
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient flex items-center justify-center p-4 relative">
      <FloatingParticles />
      <div className="w-full max-w-md relative z-10">
        <div className="bg-black bg-opacity-40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 signup-form">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 slide-in-left">Create Account</h2>
            <p className="text-gray-300 slide-in-right">Join our seller community</p>
          </div>
          
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="slide-in-left">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:outline-none input-focus transition-all duration-300"
                placeholder="Enter your name"
                required
              />
            </div>
            
            <div className="slide-in-right">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:outline-none input-focus transition-all duration-300"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="slide-in-right">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:outline-none input-focus transition-all duration-300"
                placeholder="Enter your phone number"
                required
              />
            </div>
            
            <div className="slide-in-left">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:outline-none input-focus transition-all duration-300"
                placeholder="Create a password"
                required
              />
            </div>
            
            <div className="slide-in-right">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:outline-none input-focus transition-all duration-300"
                placeholder="Confirm your password"
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
                  Creating account...
                </span>
              ) : 'Sign Up'}
            </button>
          </form>
          
          <div className="mt-6 text-center slide-in-left">
            <p className="text-gray-300">
              Already have an account?{' '}
              <a 
                href="#" 
                onClick={() => setCurrentPage('login')}
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
