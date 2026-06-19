import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import ChangePasswordModal from './ChangePasswordModal';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Link to={user?.role === 'admin' ? '/admin' : '/employee'} className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white shadow-sm group-hover:bg-primary-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Cartify
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-[10px] font-bold uppercase">
                    {user.username.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-tighter">
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="btn btn-secondary border-none hover:bg-slate-50 hover:text-slate-700 shadow-none !px-3"
                >
                  <svg className="w-4 h-4 mr-1.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Change Password
                </button>

                <button
                  onClick={handleLogout}
                  className="btn btn-secondary border-none hover:bg-red-50 hover:text-red-600 shadow-none !px-3"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3 3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <ChangePasswordModal 
        isOpen={isChangePasswordOpen} 
        onClose={() => setIsChangePasswordOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;
