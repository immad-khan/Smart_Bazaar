import { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaClock, FaStore, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

export default function AdminPanel() {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);

  const adminUserId = 1; // This should come from logged-in admin user

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/pending-approvals', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending approvals');
      }

      const data = await response.json();
      setPendingApprovals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    setActionLoading(requestId);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/approve/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ adminUserId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Approval failed');
      }

      // Remove from list
      setPendingApprovals(prev => prev.filter(req => req.id !== requestId));
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId) => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    setActionLoading(requestId);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/reject/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ adminUserId, reason: rejectionReason })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Rejection failed');
      }

      // Remove from list
      setPendingApprovals(prev => prev.filter(req => req.id !== requestId));
      setRejectingId(null);
      setRejectionReason('');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0715] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-purple-300">Review and manage seller registration requests</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-950/20 backdrop-blur-xl rounded-xl border border-yellow-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-300 text-sm mb-1">Pending Requests</p>
                <h3 className="text-3xl font-bold text-white">{pendingApprovals.length}</h3>
              </div>
              <FaClock className="text-yellow-400 text-3xl" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-900/30 to-green-950/20 backdrop-blur-xl rounded-xl border border-green-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm mb-1">Total Approved</p>
                <h3 className="text-3xl font-bold text-white">-</h3>
              </div>
              <FaCheckCircle className="text-green-400 text-3xl" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-900/30 to-red-950/20 backdrop-blur-xl rounded-xl border border-red-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-300 text-sm mb-1">Total Rejected</p>
                <h3 className="text-3xl font-bold text-white">-</h3>
              </div>
              <FaTimesCircle className="text-red-400 text-3xl" />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="text-purple-300 mt-4">Loading pending approvals...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && pendingApprovals.length === 0 && (
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-950/20 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-12 text-center">
            <FaCheckCircle className="text-green-400 text-5xl mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">All Caught Up!</h3>
            <p className="text-purple-300">There are no pending approval requests at the moment.</p>
          </div>
        )}

        {/* Pending Approvals List */}
        {!loading && pendingApprovals.length > 0 && (
          <div className="space-y-6">
            {pendingApprovals.map((request) => (
              <div
                key={request.id}
                className="bg-gradient-to-br from-purple-900/30 to-purple-950/20 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6 shadow-xl"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Personal Information */}
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{request.fullName}</h3>
                      <div className="flex items-center text-purple-300 mb-1">
                        <FaEnvelope className="mr-2" />
                        <span>{request.email}</span>
                      </div>
                      {request.phoneNumber && (
                        <div className="flex items-center text-purple-300">
                          <FaPhone className="mr-2" />
                          <span>{request.phoneNumber}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-purple-500/20 pt-4">
                      <h4 className="text-lg font-semibold text-purple-200 mb-3 flex items-center">
                        <FaStore className="mr-2" />
                        Business Information
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-purple-400 text-sm">Business Name:</span>
                          <p className="text-white font-semibold">{request.businessName}</p>
                        </div>
                        <div>
                          <span className="text-purple-400 text-sm flex items-center">
                            <FaMapMarkerAlt className="mr-1" /> Address:
                          </span>
                          <p className="text-white">{request.businessAddress}</p>
                        </div>
                        {request.businessPhone && (
                          <div>
                            <span className="text-purple-400 text-sm">Business Phone:</span>
                            <p className="text-white">{request.businessPhone}</p>
                          </div>
                        )}
                        {request.taxId && (
                          <div>
                            <span className="text-purple-400 text-sm">Tax ID:</span>
                            <p className="text-white">{request.taxId}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-purple-400">
                      Requested: {new Date(request.requestedAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col justify-center space-y-4">
                    {rejectingId === request.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Enter rejection reason..."
                          className="w-full px-4 py-3 bg-purple-950/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                          rows="3"
                        />
                        <button
                          onClick={() => handleReject(request.id)}
                          disabled={actionLoading === request.id}
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === request.id ? 'Rejecting...' : 'Confirm Rejection'}
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(null);
                            setRejectionReason('');
                          }}
                          className="w-full bg-purple-950/30 border border-purple-500/30 text-purple-300 hover:bg-purple-900/30 font-semibold py-3 rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleApprove(request.id)}
                          disabled={actionLoading === request.id}
                          className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FaCheckCircle className="mr-2" />
                          {actionLoading === request.id ? 'Approving...' : 'Approve Seller'}
                        </button>

                        <button
                          onClick={() => setRejectingId(request.id)}
                          disabled={actionLoading === request.id}
                          className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FaTimesCircle className="mr-2" />
                          Reject Seller
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
