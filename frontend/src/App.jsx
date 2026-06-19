import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import Portal from './pages/employee/Portal';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;
  
  return children;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {user && <Navbar />}
        <main className="flex-grow">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/admin" 
              element={
                <PrivateRoute role="admin">
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/employee" 
              element={
                <PrivateRoute role="employee">
                  <Portal />
                </PrivateRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
