import { useState } from 'react';
import api from '../utils/api';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.put('/api/auth/change-password', {
        currentPassword,
        newPassword,
      });

      setSuccess(data.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Auto close after 2 seconds on success
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 2000);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to update password. Please try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-premium border border-slate-100 overflow-hidden transform scale-100 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">Change Password</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Secure your Cartify account</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold animate-fade-in flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl text-xs font-semibold animate-fade-in flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Current Password</label>
              <input 
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="input-field"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Password</label>
              <input 
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="input-field"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
              <input 
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="input-field"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 btn btn-secondary py-3 text-xs uppercase tracking-widest font-bold"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 btn btn-primary py-3 text-xs uppercase tracking-widest font-bold shadow-lg"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
