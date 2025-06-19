import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bus, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Bus className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">BusTravel</span>
          </Link>

          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="bg-gray-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.role}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Link
                  to="/profile"
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Settings className="h-5 w-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
