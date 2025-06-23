import { Link } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 shadow-lg backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl font-bold text-white hover:text-blue-200 transition-all duration-300 transform hover:scale-105"
          >
            <span className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">CH</span>
              </div>
              <span>Competitive Helper</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-white hover:text-blue-200 font-medium transition-all duration-300 hover:scale-105 relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-200 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              to="/create" 
              className="bg-white text-blue-600 px-6 py-2 rounded-full font-medium hover:bg-blue-50 hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5"
            >
              Create Contest
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white hover:text-blue-200 focus:outline-none transition-colors duration-300"
          >
            <svg 
              className={`w-6 h-6 transform transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="pt-4 pb-2 space-y-3">
            <Link 
              to="/" 
              className="block text-white hover:text-blue-200 font-medium transition-colors duration-300 hover:translate-x-2 transform"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/create" 
              className="block bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-all duration-300 hover:translate-x-2 transform w-fit"
              onClick={() => setIsMenuOpen(false)}
            >
              Create Contest
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}