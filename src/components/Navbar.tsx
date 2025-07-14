import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, User, LogOut, Settings } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg border-b-2 border-sky-500">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-sky-500" />
            <span className="text-xl font-bold text-gray-800">
              Sistem Pakar Kesehatan
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-sky-500 transition-colors"
            >
              Beranda
            </Link>
            <Link
              to="/education"
              className="text-gray-700 hover:text-sky-500 transition-colors"
            >
              Edukasi
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/diagnose"
                  className="text-gray-700 hover:text-sky-500 transition-colors"
                >
                  Diagnosa
                </Link>
                <Link
                  to="/history"
                  className="text-gray-700 hover:text-sky-500 transition-colors"
                >
                  Riwayat
                </Link>
                
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 text-gray-700 hover:text-sky-500 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-700">{user.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-700 hover:text-red-500 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-sky-500 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;