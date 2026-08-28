import { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        if (parsed.token) {
          const payload = JSON.parse(atob(parsed.token.split('.')[1]));
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            localStorage.removeItem('userInfo');
            setUser(null);
          } else {
            setUser(parsed);
          }
        } else {
          setUser(parsed);
        }
      } catch {
        localStorage.removeItem('userInfo');
        setUser(null);
      }
    }
    setLoading(false);

    const handleUnauthorized = (e) => {
      setUser(null);
      localStorage.removeItem('userInfo');
      if (e.detail?.message) {
        setAuthError(e.detail.message);
      }
    };

    window.addEventListener('cartify:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('cartify:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (username, password) => {
    try {
      const { data } = await api.post('/api/auth/login', {
        username,
        password,
      });

      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (username, password, role) => {
    try {
      const res = await api.post('/api/auth/register', {
        username,
        password,
        role,
      });

      if (res.status === 201) {
        setUser(res.data);
        localStorage.setItem('userInfo', JSON.stringify(res.data));
        return { success: true };
      } else if (res.status === 202) {
        return { success: false, message: res.data.message, pending: true };
      }
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        if (parsed.sessionId) {
          await api.post('/api/auth/logout', { sessionId: parsed.sessionId });
        }
      } catch (err) {
        console.error('Failed to log logout session:', err);
      }
    }
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, authError, setAuthError }}>
      {children}
    </AuthContext.Provider>
  );
};
