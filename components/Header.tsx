import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Download, ShieldCheck } from 'lucide-react';
import { PLATFORMS } from '../constants';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-700 transition-colors">
              <Download className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              SnapSave Pro
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`text-sm font-medium transition-colors hover:text-indigo-600 ${isActive('/') ? 'text-indigo-600' : 'text-slate-600'}`}>
              Home
            </Link>
            {PLATFORMS.slice(0, 4).map((platform) => (
              <Link
                key={platform.id}
                to={`/${platform.id}`}
                className={`text-sm font-medium transition-colors hover:text-indigo-600 ${isActive('/' + platform.id) ? 'text-indigo-600' : 'text-slate-600'}`}
              >
                {platform.name}
              </Link>
            ))}
            <Link to="/thumbnail-downloader" className={`text-sm font-medium transition-colors hover:text-indigo-600 ${isActive('/thumbnail-downloader') ? 'text-indigo-600' : 'text-slate-600'}`}>
              Thumbnail Downloader
            </Link>
            <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
              <ShieldCheck className="w-3 h-3" />
              <span>Safe & Free</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-500 hover:text-slate-700 focus:outline-none p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
            >
              Home
            </Link>
            {PLATFORMS.map((platform) => (
              <Link
                key={platform.id}
                to={`/${platform.id}`}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
              >
                {platform.name} Downloader
              </Link>
            ))}
            <Link
              to="/thumbnail-downloader"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
            >
              Thumbnail Downloader
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;