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
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
            <span className="hidden sm:inline text-lg md:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              CodexCuisine
            </span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-purple-600 transition-colors text-sm"
            >
              Home
            </Link>
            <Link
              to="/discover"
              className="text-gray-700 hover:text-purple-600 transition-colors flex items-center gap-1 text-sm"
            >
              <Search className="h-4 w-4" />
              Discover
            </Link>
            <Link
              to="/videos"
              className="text-gray-700 hover:text-purple-600 transition-colors flex items-center gap-1 text-sm"
            >
              <Play className="h-4 w-4" />
              Videos
            </Link>
            {user && (
              <>
                <Link
                  to="/meal-plan"
                  className="text-gray-700 hover:text-purple-600 transition-colors text-sm"
                >
                  Meal Plan
                </Link>
                <Link
                  to="/shopping-list"
                  className="text-gray-700 hover:text-purple-600 transition-colors flex items-center gap-1 text-sm"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Shopping
                </Link>
                <Link
                  to="/preferences"
                  className="text-gray-700 hover:text-purple-600 transition-colors flex items-center gap-1 text-sm"
                >
                  <Settings className="h-4 w-4" />
                  Preferences
                </Link>
                <Link
                  to="/collections"
                  className="text-gray-700 hover:text-purple-600 transition-colors text-sm"
                >
                  Collections
                </Link>
              </>
            )}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-md mx-4 lg:mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                aria-label="Search recipes"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm transition-colors"
              />
            </div>
          </div>

          {/* User Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-4 relative">
            {user ? (
              <>
                <Link
                  to="/collections"
                  className="text-gray-700 hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg p-2 transition-colors"
                  aria-label="View collections"
                  title="View collections"
                >
                  <Heart className="h-5 w-5" />
                </Link>

                {/* User Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setShowUserMenu(false);
                      if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        setShowUserMenu(!showUserMenu);
                      }
                    }}
                    aria-label="Open user menu"
                    aria-expanded={showUserMenu}
                    aria-haspopup="true"
                    className="text-gray-700 hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg p-2 transition-colors"
                  >
                    <User className="h-5 w-5" />
                  </button>

                  {showUserMenu && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 py-2"
                      role="menu"
                    >
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.email}
                        </p>
                        <p className="text-xs text-gray-600">
                          {user.role || "User"}
                        </p>
                      </div>

                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-purple-50 focus:bg-purple-50 focus:outline-none transition-colors flex items-center gap-2"
                        onClick={() => setShowUserMenu(false)}
                        role="menuitem"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>

                      <Link
                        to="/preferences"
                        className="block px-4 py-2 text-gray-700 hover:bg-purple-50 focus:bg-purple-50 focus:outline-none transition-colors flex items-center gap-2"
                        onClick={() => setShowUserMenu(false)}
                        role="menuitem"
                      >
                        <Settings className="h-4 w-4" />
                        Preferences
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-none transition-colors flex items-center gap-2"
                        role="menuitem"
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
                  className="text-gray-700 hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg px-3 py-2 transition-colors font-medium text-sm"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors font-medium text-sm"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 text-gray-700 hover:text-purple-600 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {showMobileMenu ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div
            className="lg:hidden pb-4 border-t"
            onKeyDown={(e) => {
              if (e.key === "Escape") setShowMobileMenu(false);
            }}
          >
            <div className="py-3">
              <div className="relative px-2 mb-3">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search..."
                  aria-label="Search recipes (mobile)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm transition-colors"
                />
              </div>
            </div>
            <nav className="space-y-1">
              <Link
                to="/"
                className="block px-4 py-2 text-gray-700 hover:bg-purple-50 focus:bg-purple-50 focus:outline-none transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                Home
              </Link>
              <Link
                to="/discover"
                className="block px-4 py-2 text-gray-700 hover:bg-purple-50 focus:bg-purple-50 focus:outline-none transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                Discover
              </Link>
              <Link
                to="/videos"
                className="block px-4 py-2 text-gray-700 hover:bg-purple-50 focus:bg-purple-50 focus:outline-none transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                Videos
              </Link>
              {user && (
                <>
                  <Link
                    to="/meal-plan"
                    className="block px-4 py-2 text-gray-700 hover:bg-purple-50 focus:bg-purple-50 focus:outline-none transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Meal Plan
                  </Link>
                  <Link
                    to="/shopping-list"
                    className="block px-4 py-2 text-gray-700 hover:bg-purple-50 focus:bg-purple-50 focus:outline-none transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Shopping List
                  </Link>
                  <Link
                    to="/preferences"
                    className="block px-4 py-2 text-gray-700 hover:bg-purple-50 focus:bg-purple-50 focus:outline-none transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Preferences
                  </Link>
                  <Link
                    to="/collections"
                    className="block px-4 py-2 text-gray-700 hover:bg-purple-50 focus:bg-purple-50 focus:outline-none transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Collections
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-purple-50 focus:bg-purple-50 focus:outline-none transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-none transition-colors font-medium"
                  >
                    Sign Out
                  </button>
                </>
              )}
              {!user && (
                <>
                  <button
                    onClick={() => {
                      navigate("/login");
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-purple-50 focus:bg-purple-50 focus:outline-none transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      navigate("/signup");
                      setShowMobileMenu(false);
                    }}
                    className="block w-full mx-2 text-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors font-medium rounded-lg"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
