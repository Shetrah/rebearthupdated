// components/NavAdminButton.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavAdminButton: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="ml-4">
      {user?.role === 'admin' ? (
        <button
          onClick={handleLogout}
          className="text-sm text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
        >
          Logout Admin
        </button>
      ) : (
        <button
          onClick={() => navigate(user ? '/admin' : '/login', user ? undefined : { state: { from: '/admin' } })}
          className="text-sm text-white bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg"
        >
          Admin
        </button>
      )}
    </div>
  );
};

export default NavAdminButton;

