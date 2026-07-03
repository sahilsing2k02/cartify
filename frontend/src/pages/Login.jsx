import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [error, setError] = useState('');
  
  const { login, register, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'employee') navigate('/employee');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    let res;
    if (isRegistering) {
      res = await register(username, password, role);
    } else {
      res = await login(username, password);
    }

    if (!res.success) {
      setError(res.message);
    }
  };

  const bgClass = isRegistering
    ? "min-h-screen flex flex-col justify-center bg-white sm:bg-gradient-to-tr sm:from-red-50 sm:via-white sm:to-red-100/40 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500"
    : "min-h-screen flex flex-col justify-center bg-white sm:bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500";

  const cardClass = isRegistering
    ? "bg-white py-8 px-4 border border-red-100/80 sm:rounded-2xl sm:shadow-soft sm:px-10 transition-all duration-500"
    : "bg-white py-8 px-4 border-0 sm:border border-slate-200 sm:rounded-2xl sm:shadow-soft sm:px-10 transition-all duration-500";

  const logoBgClass = isRegistering
    ? "bg-gradient-to-tr from-red-600 to-red-500 shadow-red-200 shadow-lg"
    : "bg-primary-600 shadow-primary-100 shadow-lg";

  const titleClass = isRegistering
    ? "text-center text-3xl font-extrabold text-red-950 tracking-tight transition-colors duration-500"
    : "text-center text-3xl font-extrabold text-slate-900 tracking-tight transition-colors duration-500";

  const subtitleClass = isRegistering
    ? "mt-2 text-center text-sm text-red-700/80 transition-colors duration-500"
    : "mt-2 text-center text-sm text-slate-600 transition-colors duration-500";

  const labelClass = isRegistering
    ? "block text-sm font-semibold text-red-900 mb-1.5 transition-colors duration-500"
    : "block text-sm font-semibold text-slate-700 mb-1.5 transition-colors duration-500";

  const inputClass = isRegistering
    ? "block w-full px-4 py-2.5 text-sm border border-red-200 rounded-xl bg-red-50/10 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-slate-800 placeholder-slate-400"
    : "block w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-slate-800 placeholder-slate-400";

  const buttonClass = isRegistering
    ? "w-full py-2.5 text-base font-bold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 focus:ring-2 focus:ring-red-500 rounded-xl shadow-md shadow-red-200 transition-all active:scale-[0.98]"
    : "w-full py-2.5 text-base font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 focus:ring-2 focus:ring-primary-500 rounded-xl shadow-md shadow-primary-200 transition-all active:scale-[0.98]";

  const toggleClass = isRegistering
    ? "w-full text-center text-sm font-semibold text-red-600 hover:text-red-700 hover:underline transition-colors"
    : "w-full text-center text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors";

  return (
    <div className={bgClass}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-500 ${logoBgClass}`}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
        <h2 className={titleClass}>
          {isRegistering ? 'Create your account' : 'Welcome back'}
        </h2>
        <p className={subtitleClass}>
          {isRegistering ? 'Join Cartify and start managing.' : 'Simplify your inventory and sales.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={cardClass}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg text-sm font-medium animate-fade-in flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                {error}
              </div>
            )}
            
            <div>
              <label className={labelClass}>
                Username
              </label>
              <input
                type="text"
                required
                className={inputClass}
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>
                Password
              </label>
              <input
                type="password"
                required
                className={inputClass}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                className={buttonClass}
              >
                {isRegistering ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <button
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
              className={toggleClass}
            >
              {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center gap-4">
             <div className="text-xs text-slate-400 font-medium uppercase tracking-widest">
               Cartify v2.1
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
