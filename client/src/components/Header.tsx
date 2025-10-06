import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
  variant?: 'landing' | 'app';
  user?: any;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ variant = 'landing', user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <nav className="relative z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
            <span className="text-xl font-bold text-slate-900">FAQ Generator</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {variant === 'landing' && (
              <>
                <Link
                  to="/pricing"
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg font-medium transition-all"
                >
                  Pricing
                </Link>
                <Link
                  to="/demo"
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg font-medium transition-all"
                >
                  Demo
                </Link>
                <Link
                  to="/contact"
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg font-medium transition-all"
                >
                  Contact
                </Link>
              </>
            )}
            
            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-slate-200">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg font-medium transition-all"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={onLogout}
                    className="px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg font-medium transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;

