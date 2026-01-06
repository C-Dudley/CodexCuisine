import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  User,
  Heart,
  BookOpen,
  ShoppingCart,
  Settings,
  Play,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-purple-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              CodexCuisine
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-purple-600 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/discover"
              className="text-gray-700 hover:text-purple-600 transition-colors flex items-center gap-1"
            >
              <Search className="h-4 w-4" />
              Discover
            </Link>
            <Link
              to="/videos"
              className="text-gray-700 hover:text-purple-600 transition-colors flex items-center gap-1"
            >
              <Play className="h-4 w-4" />
              Videos
            </Link>
            {user && (
              <>
                <Link
                  to="/meal-plan"
                  className="text-gray-700 hover:text-purple-600 transition-colors"
                >
                  Meal Plan
                </Link>
                <Link
                  to="/shopping-list"
                  className="text-gray-700 hover:text-purple-600 transition-colors flex items-center gap-1"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Shopping
                </Link>
                <Link
                  to="/preferences"
                  className="text-gray-700 hover:text-purple-600 transition-colors flex items-center gap-1"
                >
                  <Settings className="h-4 w-4" />
                  Preferences
                </Link>
                <Link
                  to="/collections"
                  className="text-gray-700 hover:text-purple-600 transition-colors"
                >
                  Collections
                </Link>
              </>
            )}
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search CodexCuisine..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4 relative">
            {user ? (
              <>
                <Link
                  to="/collections"
                  className="text-gray-700 hover:text-purple-600 transition-colors"
                >
                  <Heart className="h-5 w-5" />
                </Link>

                {/* User Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="text-gray-700 hover:text-purple-600 transition-colors"
                  >
                    <User className="h-5 w-5" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 py-2">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                        <p className="text-xs text-gray-600">{user.role || "User"}</p>
                      </div>

                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-purple-50 transition-colors flex items-center gap-2"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>

                      <Link
                        to="/preferences"
                        className="block px-4 py-2 text-gray-700 hover:bg-purple-50 transition-colors flex items-center gap-2"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Preferences
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate("/login")}
                  className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
